"use strict";
const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const config = require("../config");
const router = express.Router();

require("../models/prizeModel");

const { User } = require("../models/userModel");

const createAuthToken = function (user) {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: "HS256"
  });
};

const localAuth = passport.authenticate("local", {session: false});
router.use(bodyParser.json());
// The user provides a username and password to login
router.post("/login", localAuth, (req, res) => {
  const userId = req.user.id || req.user._id;
  User.findById(userId)
    .populate("awardedPrizes")
    .then(user => {
      console.log(user.serialize());
      const authToken = createAuthToken(user.serialize());
      res.json({authToken});
    })

});

const jwtAuth = passport.authenticate("jwt", {session: false});

// The user exchanges a valid JWT for a new one with a later expiration
router.post("/refresh", jwtAuth, (req, res) => {
  console.log("[[[ /refresh endpoint REQ.USER ]]]", req.user);
  const userId = req.user.id || req.user._id;
  User.findById(userId)
    .populate("awardedPrizes")
    .then(user => {
      console.log(user.serialize());
      const authToken = createAuthToken(user.serialize());
      res.json({authToken});
    })
});

// I exported createAuthToken function
module.exports = { router, createAuthToken };
