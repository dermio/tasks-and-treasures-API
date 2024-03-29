const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

const { app, runServer, closeServer } = require("../server");
const { Task } = require("../models/taskModel");
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
  console.warn("Deleting database");
  return mongoose.connection.dropDatabase();
}

function seedTasks() {
  let tasksArr = [];
  for (let i = 0; i < 10; i++) {
    tasksArr.push(generateTaskData());
  }
  return Task.insertMany(tasksArr);
}

function generateTaskData() {
  return {
    taskName: faker.commerce.productName(),
    familyCode: "schwarzeneggerT800"
  };
}

describe("Tasks API resource", function () {
  const username = "exampleUser";
  const password = "examplePass";
  const role = "Example";
  const familyCode = "schwarzeneggerT800";


  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedTasks` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  let currentUser;

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
    .then(seedTasks)
    .then(tasks => {
      let taskIds = tasks.map(task => task.id);
      console.log("[[[ TASKS ]]]", taskIds)
      return Family.findOneAndUpdate(
        { familyCode },
        {
          $set: {
            familyCode,
            currentTasks: taskIds
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      )
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
    it("should return all tasks", function () {
      let res;
      return chai.request(app)
        .get(`/api/tasks/${familyCode}`)
        .set("Authorization", `Bearer ${token}`)
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

      return chai
        .request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send(newTask)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.should.be.a("object");
          res.body.should.include.keys("taskName", "familyCode");
          res.body.taskName.should.equal(newTask.taskName);
          res.body.id.should.not.be.null;
          res.body.familyCode.should.equal(newTask.familyCode);
          return Task.findById(res.body.id);
        })
        .then(function (task) { // task is a single doc from Mongo
          task.taskName.should.equal(newTask.taskName);
          task.familyCode.should.equal(newTask.familyCode);
        });
    });
  });

  describe("DELETE endpoint", function () {
    it("should delete a task", function () {
      let task;

      return Task
        .findOne()
        .then(function (_task) {
          task = _task;
          return chai.request(app).delete(`/api/tasks/${task.id}`)
                    .set("Authorization", `Bearer ${token}`);
        })
        .then(function (res) {
          res.should.have.status(204);
        })
        .then(function (_task) {
          should.not.exist(_task);
        });
    });
  });

  describe("PUT endpoint", function () {
    /* strategy:
    1. Get an existing task from db
    2. Make a PUT request to update that task
    3. Prove task returned by request contains data we sent
    4. Prove task in db is correctly updated */

    it("should update fields you send over", function () {
      let updateData = {
        taskName: "plant trees"
      };

      return Task
        .findOne()
        .then(function (task) {
          updateData.id = task.id;

          /* make request then inspect it to make sure
          it reflects the data that was sent */
          return chai.request(app)
            .put(`/api/tasks/${task.id}`)
            .set("Authorization", `Bearer ${token}`)
            .send(updateData);
        })
        .then(function (res) {
          res.should.have.status(204);
          // return the document with correct Id
          return Task.findById(updateData.id);
        })
        .then(function (task) {
          /* task is the returned document from Mongo
          with the updated values */
          // console.log(task);
          task.taskName.should.equal(updateData.taskName);
        });
    });
  });

});


/* seedTasks function used in the test-familyRouter file.
Export so I don't have to create mock Tasks for the test-familyRouter. */
module.exports = { seedTasks };
