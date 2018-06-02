const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");

const { app, runServer, closeServer } = require("../server");
const { Task } = require("../models");
const { TEST_DATABASE_URL } = require("../config");

const should = chai.should();
chai.use(chaiHttp);

// describe("API", function () {
//   it("should respond with status 200 on GET requests", function () {
//     return chai.request(app)
//               .get("/api/shoryuken")
//               .then(function (res) {
//                 res.should.have.status(200);
//                 res.should.be.json;
//               });
//   });
// });

/* this function deletes the entire database.
we'll call it in an `afterEach` block below
to ensure data from one test does not stick
around for next one */
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe("GET endpoint", function () {
  it("should return all tasks", function () {
    return chai.request(app)
              .get("/api/task")
              .then(function (res) {
                res.should.have.status(200);
                res.should.be.json;
              });
  });
});


describe("Tasks API resource", function () {
  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedRestaurantData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {

  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });
});

