const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const faker = require("faker");

const { app, runServer, closeServer } = require("../server");
const { Prize } = require("../models/prizeModel");
const { TEST_DATABASE_URL } = require("../config");

const { Family } = require("../models/familyModel");

const should = chai.should();
chai.use(chaiHttp);


// Testing Authentication for protected endpoints
// const jwt = require("jsonwebtoken"); Use `jwt` if I write my own Token
const { JWT_SECRET } = require("../config");
const { createAuthToken } = require("../auth/router");
const { User } = require("../users");
const expect = chai.expect;


/* this function deletes the entire database.
we'll call it in an `afterEach` block below
to ensure data from one test does not stick
around for next one */
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

// Only one Prize is awarded to the child(ren)
function seedPrizes() {
  /* Might not need array and insertMany().
  If only create one prize use create(). */
  let prizesArr = [];
  for (let i = 0; i < 1; i++) {
    prizesArr.push(generatePrizeData());
  }
  return Prize.insertMany(prizesArr);
}

function generatePrizeData() {
  return {
    prizeName: faker.commerce.product(),
    familyCode: "schwarzeneggerT800"
  };
}

describe.only("Prizes API resource", function () {
  const username = "exampleUser";
  const password = "examplePass";
  const role = "Example";
  const familyCode = "schwarzeneggerT800";

  let currentUser;

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedPrizes` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    // Need to create a User and seed the database
    return User.hashPassword(password).then(password =>
      User.create({
        username,
        password,
        role,
        familyCode
      })
    )
    .then(user => {
      currentUser = user;
      return user;
    })
    .then(seedPrizes)
    .then(prizes => {
      let prize = prizes;
      console.log("[[[ PRIZE, beforeEach() ]]]", prize);

      /* The prize document was successfully created by calling seedPrizes
      in the prior then() method.

      {
        _id: 5cad114369ede7146497e106,
        prizeName: 'Computer',
        familyCode: 'schwarzeneggerT800',
        __v: 0
      }
      */


      return Family.findOneAndUpdate(
        { familyCode },
        {
          $set: {
            familyCode,
            prize
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      )
    })

    /* Extra code */
    .then(family => { // extra console.log
      console.log("[[[ The Family with the Prize]]]", family);

      /* The returned Family does NOT have the `currentPrize` field populated.
      Why does the currentPrize field remain null, despite the prize
      creation in the prior then() method?

      {
        tasksFinalized: false,
        currentTasks: [],
        currentPrize: null,
        _id: 5cad114469ede7146497e10a,
        familyCode: 'schwarzeneggerT800',
        __v: 0
      }
      */

    });
  });

  afterEach(function () {
    // Need to remove the User and tear down the database
    return User.remove({}).then(tearDownDb);
  });

  after(function () {
    return closeServer();
  });

  const token = createAuthToken({ username, role, password }); // familyCode?

  // If don't use createAuthToken funtion, create own token function
  /* const token = jwt.sign(
    {
      user: {
        username,
        role,
        familyCode
      }
    },
    "fishing", // or JWT_SECRET
    {
      algorithm: "HS256",
      expiresIn: "7d"
    }
  ); */

  describe("GET endpoint", function () {
    it("should return the prize", function () {
      let res;
      return chai.request(app)
        .get(`/api/prizes/${familyCode}`)
        .set("Authorization", `Bearer ${token}`)
        .then(function (_res) {
          console.log("[[[ _res, GET endpoint ]]]", _res.should);
          res = _res;
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a("array");
          res.body.forEach(prize => {
            prize.should.be.a("object");
            prize.should.include.keys("prizeName", "familyCode");
          });
          return Prize.count();
        })
        .then(function (count) {
          res.body.length.should.equal(count);
        });
    });
  });

  describe("POST endpoint", function () {
    it("should add a new prize", function () {
      let newPrize = generatePrizeData();

      return chai
        .request(app)
        .post("/api/prizes")
        .set("Authorization", `Bearer ${token}`)
        .send(newPrize)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.should.be.a("object");
          res.body.should.include.keys("prizeName", "familyCode");
          res.body.prizeName.should.equal(newPrize.prizeName);
          res.body.id.should.not.be.null;
          res.body.familyCode.should.equal(newPrize.familyCode);
          return Prize.findById(res.body.id);
        })
        .then(function (prize) { // prize is a single doc from Mongo
          prize.prizeName.should.equal(newPrize.prizeName);
          prize.familyCode.should.equal(newPrize.familyCode);
        });
    });
  });

  describe("DELETE endpoint", function () {
    it("should delete a prize", function () {
      let prize;

      return Prize
        .findOne()
        .then(function (_prize) {
          prize = _prize;
          return chai.request(app).delete(`/api/prizes/${prize.id}`)
                    .set("Authorization", `Bearer ${token}`);
        })
        .then(function (res) {
          res.should.have.status(204);
        })
        .then(function (_prize) {
          should.not.exist(_prize);
        });
    });
  });

  describe("PUT endpoint", function () {
    /* strategy:
    1. Get an existing prize from db
    2. Make a PUT request to update that prize
    3. Prove prize returned by request contains data we sent
    4. Prove prize in db is correctly updated */

    it("should update fields you send over", function () {
      let updateData = {
        prizeName: "plant trees"
      };

      return Prize
        .findOne()
        .then(function (prize) {
          updateData.id = prize.id;

          /* make request then inspect it to make sure
          it reflects the data that was sent */
          return chai.request(app)
            .put(`/api/prizes/${prize.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(updateData);
        })
        .then(function (res) {
          res.should.have.status(204);
          // return the document with correct Id
          return Prize.findById(updateData.id);
        })
        .then(function (prize) {
          /* prize is the returned document from Mongo
          with the updated values */
          // console.log(prize);
          prize.prizeName.should.equal(updateData.prizeName);
        });
    });
  });

});
