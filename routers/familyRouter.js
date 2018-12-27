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


/* Q. Why am I getting by familyCode?
A. When admin client page loads, want to get family. */
router.get("/:familyCode", jwtAuth, (req, res) => {
  // STUBBED CODE

  // get family

  // res.status(200).json({
  //   message: "Access granted: GET /api/family/:familyCode"
  // });

  Family.findOne({ familyCode: req.params.familyCode })
    .then(family => {
      res.status(200).json({
        message: "Access granted: GET /api/family/:familyCode",
        family
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Something went horribly awry" });
    });
});

router.put("/:familyCode/finalize", jwtAuth, (req, res) => {
  // res.status(204).end(); // temp to make test-familyRouter pass

  // STUBBED CODE

  // handle finalization

  // parent will click Finalize button
  // family model's tasksFinalized property set to true

  // ELSEWHERE you will need to enforce this behavior. (ie frontend)

  console.log("[[[ /:familyCode/finalize ]]]");

  let toUpdate = { tasksFinalized: true };
  Family//.findOne({ familyCode: req.params.familyCode })
    // .findById(req.user.id) // This doesn't work!!
    .findOneAndUpdate(
      { familyCode: req.params.familyCode },
      { $set: toUpdate },
      { new: true } // return the modified document rather than the original
    )
    .then(family => {
      // eventually delete this response
      res.status(200).send({
        message: "Access granted: PUT /api/family/:familyCode/finalize",
        family
      });

      // res.status(204).end(); // Use this response
    });
});

router.put("/:familyCode/reset", jwtAuth, (req, res) => {
  console.log("[[[ /:familyCode/reset ]]]");

  let toUpdate = {
    tasksFinalized: false,
    currentTasks: [],
    currentPrize: null
  };

  Family//.findOne({ familyCode: req.params.familyCode })
    // .findById(req.user.id) // This doesn't work!!
    .findOneAndUpdate(
      { familyCode: req.params.familyCode },
      { $set: toUpdate },
      { new: true } // return the modified document rather than the original
    )
    .then(family => {
      // eventually delete this response
      res.status(200).send({
        message: "Access granted: PUT /api/family/:familyCode/reset",
        family
      });

      // res.status(204).end(); // Use this response
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Something went horribly awry" });
    });
});

module.exports = router;
