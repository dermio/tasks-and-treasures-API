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
