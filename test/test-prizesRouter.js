const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const faker = require("faker");

const { app, runServer, closeServer } = require("../server");
const { Prize } = require("../models/prizeModel");
const { TEST_DATABASE_URL } = require("../config");

const should = chai.should();
chai.use(chaiHttp);


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

describe("Prizes API resource", function () {
  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedPrizes` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedPrizes();
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

  describe("GET endpoint", function () {
    it("should return the prize", function () {
      let res;
      return chai.request(app)
        .get("/api/prizes/schwarzeneggerT800")
        .then(function (_res) {
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
          return chai.request(app).delete(`/api/prizes/${prize.id}`);
        })
        .then(function (res) {
          res.should.have.status(204);
        })
        .then(function (_prize) {
          should.not.exist(_prize);
        });
    });
  });


});

