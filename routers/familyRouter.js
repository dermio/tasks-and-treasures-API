const express = require("express");
const router = express.Router();

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { Prize } = require("../models/prizeModel");
const { User } = require("../models/userModel");
const { Task } = require("../models/taskModel");
const { Family } = require("../models/familyModel");

// Do I need to authenicate?
const passport = require("passport");
const jwtAuth = passport.authenticate("jwt", { session: false });


// What am I getting by familyCode?
router.get("/:familyCode", jwtAuth, (req, res) => {
  // STUBBED CODE

  // get family
  res.status(200).json({
    message: "Access granted: GET /api/family/:familyCode"
  });
});

router.put("/:familyCode/finalize", (req, res) => {
  res.status(204).end(); // temp to make test-familyRouter pass

  // STUBBED CODE

  // handle finalization

  // parent will click Finalize button
  // family model's tasksFinalized property set to true

  // ELSEWHERE you will need to enforce this behavior. (ie frontend)
});

router.put(":/familyCode/reset", (req, res) => {
  // STUBBED CODE

  // handle reset
});

module.exports = router;
