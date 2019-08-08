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

  return Family
    .findOneAndUpdate(
      { familyCode: req.params.familyCode },
      {
        $set: {
          familyCode: req.params.familyCode
        }
      },
      { new: true, upsert: true } // return the modified document rather than the original
    )
    /* Before finalizing Tasks list, check if the Family `tasksFinalized`
    key is already True. If finalized, send error. Otherwise continue. */
    .then(family => {
      if (!family.tasksFinalized) {
        family.tasksFinalized = true;
        return family.save();
      } else {
        return res.json(500, { message: "TasksFinalized is already True." });
      }
    })
    .then(family => {
      // eventually delete this response
      res.status(200).send({
        message: "Access granted: PUT /api/family/:familyCode/finalize",
        family
      });

      // res.status(204).end(); // Use this response
    })
    .catch(err => res.json({ err: "There was an error" + err} ));
});

router.put("/:familyCode/reset", jwtAuth, (req, res) => {
  console.log("[[[ /:familyCode/reset ]]]");

  /* In the Family document, these three field values are Reset.
  This affects all Child users for a given Family. */
  let toUpdate = {
    tasksFinalized: false,
    currentTasks: [],
    currentPrize: null
  };

  let _family;

  Family//.findOne({ familyCode: req.params.familyCode })
    // .findById(req.user.id) // This doesn't work!!
    .findOneAndUpdate(
      { familyCode: req.params.familyCode },
      { $set: toUpdate },
      { new: true } // return the modified document rather than the original
    )
    .then(family => {
      _family = family;

      /* In addition to resetting the three field values in the Family
      document, the individual Child user's `tasksReadyForReview`
      field is reset to False. */
      return User.update(
        {
          familyCode: req.params.familyCode,
          role: "child"
        },
        { $set: { tasksReadyForReview: false } }
      )})
      .then(() => {
        // eventually delete this response
        res.status(200).send({
          message: "Access granted: PUT /api/family/:familyCode/reset",
          family: _family
        });

      // res.status(204).end(); // Use this response
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Something went horribly awry" });
    });
});

module.exports = router;
