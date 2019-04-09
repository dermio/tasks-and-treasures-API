const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const faker = require("faker");

const { app, runServer, closeServer } = require("../server");
const { Family } = require("../models/familyModel");
const { Task } = require("../models/taskModel");
const { seedTasks } = require("./test-tasksRouter"); // require, will re-use
const { TEST_DATABASE_URL } = require("../config");

const should = chai.should();
chai.use(chaiHttp);


const { JWT_SECRET } = require("../config");
const { createAuthToken } = require("../auth/router");
const { User } = require("../users");
const expect = chai.expect;


function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}


describe("Prizes API resource", function () {
  const username = "exampleUser";
  const password = "examplePass";
  const role = "Example";
  const familyCode = "schwarzeneggerT800";

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    // Need to create a User and seed the database
    return User
      .hashPassword(password)
      .then(password =>
        User.create({
          username,
          password,
          role,
          familyCode
        })
      )
      .then(seedTasks);
  });

  afterEach(function () {
    return User.remove({}).then(tearDownDb);
  });

  after(function () {
    return closeServer();
  });

  const token = createAuthToken({ username, role, password });


  // Remove the `only` from `descibe.only` so all the tests run
  describe("PUT, /:familyCode/finalize", function () {
    it("should finalize tasks list by parent", function () {
      // Setup Family, and a bunch of tasks.
      // Confirm if `tasksFinalized` False on the family,
      // familyModel.
      // Request to endpoint, `/:familyCode/finalize`,
        // confirm `tasksFinalized` is True on familyModel

        // 1. Find Tasks
        // 2. Find all tasks by familyCode, then create Family
          // with the code and tasks


    const familyCode = "schwarzeneggerT800";

    return Task
      .find({ familyCode })
      .then((tasks) => { // create a new familycode w/ tasks
        const toUpdate = {
          $push: {
            currentTasks: tasks
          },
          familyCode
        };
        const options = {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        };
        return Family.findOneAndUpdate({ familyCode }, toUpdate, options);
      })
      .then(family => {
        family.tasksFinalized.should.equal(false);
        return chai
          .request(app)
          .put(`/api/family/${familyCode}/finalize`)
          .set("Authorization", `Bearer ${token}`);
      })
      .then((res) => {
        res.should.have.status(200);
        return Family
          .findOne({ familyCode })
          .then(family => {
            console.log("[[[ HELLO ]]]")
            family.tasksFinalized.should.equal(true);
          });
      });

    });

  });

});

