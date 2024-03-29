const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

const { app, runServer, closeServer } = require("../server");
const { Task } = require("../models/taskModel");
const { Prize } = require("../models/prizeModel");
const { TEST_DATABASE_URL } = require("../config");

const should = chai.should();
chai.use(chaiHttp);


/* this function deletes the entire database.
we'll call it in an `afterEach` block below
to ensure data from one test does not stick
around for next one */
// function tearDownDb() {
//   console.warn('Deleting database');
//   return mongoose.connection.dropDatabase();
// }
