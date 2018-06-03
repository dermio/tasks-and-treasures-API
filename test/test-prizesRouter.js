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
function seedPrize() {
  let prize = {
    prizeName: faker.commerce.product(),
    familyCode: "schwarzeneggerT800"
  };
  return Prize.create(prize);
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
  // `seedPrize` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedPrize();
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


});

