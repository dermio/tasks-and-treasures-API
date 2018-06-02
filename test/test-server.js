const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const faker = require("faker");

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

function seedTasks() {
  console.info("seeding data")
  let tasksArr = [];
  for (let i = 0; i < 10; i++) {
    tasksArr.push(generateTaskData());
  }
  return Task.insertMany(tasksArr);
}


function generateTaskData() {
  return {
    taskName: faker.commerce.productName(),
    familyCode: "schwarzenegger8080"
  };
}

describe("Tasks API resource", function () {
  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedRestaurantData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return seedTasks();
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

  describe("GET endpoint", function () {
    it("should return all tasks", function () {
      let res;
      return chai.request(app)
        .get("/api/tasks/schwarzenegger8080")
        .then(function (_res) {
          res = _res;
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a("array");
          res.body.forEach(task => {
            task.should.be.a("object");
            task.should.include.keys("taskName", "familyCode");
          });
          return Task.count();
        })
        .then(function (count) {
          res.body.length.should.equal(count);
        });
    });
  });

  describe("POST endpoint", function () {
    it("should add a new task", function () {
      let newTask = generateTaskData();
      console.info(newTask);

      return chai
        .request(app)
        .post("/api/task")
        .send(newTask)
        .then(function (res) {
          console.log("RESPONSE", res.body);
          res.should.have.status(201);
          res.should.be.json;
          res.should.be.a("object");
          res.body.should.include.keys("taskName", "familyCode");
          res.body.taskName.should.equal(newTask.taskName);
          res.body.id.should.not.be.null;
          res.body.familyCode.should.equal(newTask.familyCode);
          return Task.findById(res.body.id);
        })
    });
  });

});

