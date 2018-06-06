const express = require("express");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator/check");
const { matchedData, sanitize } = require("express-validator/filter");
//const flash = require("connect-flash");

const { User } = require("../models/userModel");

const router = express.Router();


// Registers a new user in the database
router.post("/", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  // Validation
  req.checkBody("name", "Name is required").notEmpty();
  req.checkBody("email", "Email is required").notEmpty();
  req.checkBody("email", "Must have a valid email").isEmail();
  req.checkBody("password", "Password is required").notEmpty();
  req
    .checkBody("password", "Password must be between 5 and 72 characters long")
    .isLength({ min: 5, max: 72 });
  req
    .checkBody("password2", "Passwords do not match")
    .equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    // If there errors res.status(whatever errorish thing is).send(errors)
  } else {
    /* const newUser = new User();
    newUser.name = name;
    newUser.email = email;
    newUser.password = newUser.generateHash(password); */
    const newUser = {
      role: '',
      // code
      password: User.generateHash(password)
    };

    User.find({ email }).then(user => {
      // Checks if user already exists
      if (user.length !== 0) {
        /* req.flash("error_msg", "Username Already Exists");
        res.redirect("/register"); */

        // send this message
        const message = {
          success: false,
          msg: 'User Exists'
        };
        // User Exists res.status(whatever errorish thing is).send(msg)
      } else {
        User.create(newUser);
        /* req.flash("success_msg", "Success, You may now login"); */

        res.redirect("/login");
      }
    });
  }

});

module.exports = router;
