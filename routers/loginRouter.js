const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { JWT_SECRET } = require('../config');

/* const { check, validationResult } = require("express-validator/check");
const { matchedData, sanitize } = require("express-validator/filter");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy; */

const { User } = require("../models/userModel");


const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

router.use(bodyParser.json());

router.post("/", (req, res) => {
  let { userName, password } = req.body;
  User.findOne({ userName: userName })
      .then(user => { // user is a document from `users` collection in DB
        if (user) { // if the user exists, run `if` block
          /* compare user supplied password (user.password) to the
          hashed password using bcrypt */
          if (bcrypt.compare(user.password, password)) {
            let token = jwt.sign({
                          id: user.id,
                          username: user.username
                        }, JWT_SECRET);

            res.json({ token });
          } else {
            return res.status(401).json({ errors: "Invalid Credentials" });
          }
        } else {
          return res.status(401).json({ errors: "Invalid Credentials" });
        }
      });
});


/*
TODO on Node backend
1. Tie Login form component in React to POST
2. User registering form
3. When user is created and sent to backend,
    hash password with bcrypt and then store in mongo
4. Add bcrypt to login to verify new users that are created
*/




/*
passport.use(
  new LocalStrategy(
    { usernameField: "email", passReqToCallback: true },
    function (req, email, password, done) {
      User.findOne({ email }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: "Incorrect username or password"
          });
        }
        if (!user.validPassword(password)) {
          return done(null, false, {
            message: "Incorrect username or password"
          });
        }
        return done(null, user);
      });
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
*/

/* router.post(
  "/",
  passport.authenticate("local", {
    successRedirect: "/auth",
    failureRedirect: "/login",
    failureFlash: true
  }),
  function(req, res) {
    next();
  }
); */



module.exports = { router };
