const express = require("express");
const router = express.Router();

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { Prize } = require("../models/prizeModel");
const { User } = require("../models/userModel");
const { Task } = require("../models/taskModel");
const { Family } = require("../models/familyModel");

router.get("/:familyCode", (req, res) => {
  // STUBBED CODE

  // get family
});

router.put("/:familyCode/finalize", (req, res) => {
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
