const express = require("express");
const router = express.Router();

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { Prize } = require("../models/prizeModel");
const { User } = require("../models/userModel");
const { Family } = require("../models/familyModel");


// Authenticate all CRUD protected endpoints with `jwtAuth` middleware
const passport = require("passport");
const jwtAuth = passport.authenticate("jwt", {session: false});


// GET prize (prizes), for Parent and Child User with particular family code.
router.get("/:familyCode", jwtAuth, (req, res) => {
  Family.findOne({ familyCode: req.params.familyCode })
    .populate("currentPrize")
    .exec()
    .then(family => {
      /* Family prize might not exist, or prize may have been deleted.
      Need conditional for JSON response, to respond with prize or null. */
      const toRespond = family.currentPrize
        ? family.currentPrize.serialize() : null;
      res.json(toRespond);
    })
    .catch(err =>{
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });
});

// POST prize, for Parent User
router.post("/", jsonParser, jwtAuth, (req, res) => {
  /* Need to find the family with the familyCode req.body.familyCode,
  then see if `tasksFinalized` is true. If it is true,
  you need to respond with an error status code and a message.
  Otherwise, do what you're doing. */

  let requiredFields = ["prizeName", "familyCode"];

  for (let i = 0; i < requiredFields.length; i++) {
    let field = requiredFields[i];
    if (!(field in req.body)) {
      let message = `Missing \`${field}\`in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  let currentPrize;
  Prize.create({
    prizeName: req.body.prizeName,
    familyCode: req.body.familyCode
  })
    .then(prize => {
      currentPrize = prize;
      const toUpdate = {
        familyCode: req.body.familyCode,
        currentPrize: prize
      };

      return Family.findOneAndUpdate(
        { familyCode: req.body.familyCode },
        { $set: toUpdate },
        { new: true, upsert: true, }
      )
    })
    .then(family => res.status(201).json(currentPrize.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

// DELETE prize, for Parent User
router.delete("/:id", jwtAuth, (req, res) => {
  Prize.findByIdAndRemove(req.params.id)
      .then(() => {
        console.log(`Deleted prize with id \`${req.params.id}\``);
        res.status(204).end();
      })
      .catch(err => {
        res.status(500).json({message: "Internal server error"});
      });
});

/* PUT prize, Parent approves tasks and awards Prize to Child.
1) Find the prize by familyCode (logged in Parent). 2) Find
the Child user Id based on the Child object sent in the req.body as JSON.
3) Add the Prize to the Child user document. If field `awardedPrizes`
is absent, the field is created that has an array value. The Prize value
is pushed onto the array. */
router.put("/current/award", jsonParser, jwtAuth, (req, res) => {
  if (!(req.body.child && req.body.child._id)) {
    let message = "Request user not provided";
    console.error(message);
    res.status(400).json( {message: message} );
  }

  let childUserId = req.body.child._id;

  Prize.findOne({ familyCode: req.user.familyCode })
    // .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(prize => {
      let toUpdate = {
        $push: { // Add the prize onto array, to Child user doc
          awardedPrizes: prize
        }
      };
      return User.findByIdAndUpdate(childUserId, toUpdate);
    })
    .then(() => {
      res.status(204).end();
    })
    .catch(err => res.status(500).json( {message: "Internal server error"} ));
});

router.put("/current/reject", jsonParser, jwtAuth, (req, res) => {
  if (!(req.body.child && req.body.child._id)) {
    let message = "Request user not provided";
    console.error(message);
    res.status(400).json( {message: message} );
  }

  let childUserId = req.body.child._id;

  User.findByIdAndUpdate(childUserId, {tasksReadyForReview: false})
    .then(() => {
      res.status(204).end();
    })
    .catch(err => res.status(500).json( {message: "Internal server error"} ));
});

// PUT prize, for Parent User
router.put("/:id", jsonParser, jwtAuth, (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    let message = `Request path id (${req.params.id}) and ` +
                  `request body id (${req.body.id}) must match`;
    console.error(message);
    res.status(400).json( {message: message} );
  }

  /* we only support a subset of fields being updateable.
  if the user sent over any of the updatableFields,
  we udpate those values in document */
  let toUpdate = {};
  let updateableFields = ["prizeName"]; // update familyCode?

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Prize
    /* all key/value pairs in toUpdate will be updated
    -- that's what `$set` does */
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(prize => {
      // console.log(prize); // the document with updated fields
      res.status(204).end();
    })
    .catch(err => res.status(500).json( {message: "Internal server error"} ));
});

module.exports = router;
