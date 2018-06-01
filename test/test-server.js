const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");

const { app, runServer, closeServer } = require("../server");
const { Task } = require("../models");
const { TEST_DATABASE_URL } = require("../config");

const should = chai.should();
chai.use(chaiHttp);

describe("API", function () {
  it("should respond with status 200 on GET requests", function () {
    return chai.request(app)
              .get("/api/shoryuken")
              .then(function (res) {
                res.should.have.status(200);
                res.should.be.json;
              });
  });
});
