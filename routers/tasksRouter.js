const express = require("express");
const router = express.Router();

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { Task } = require("../models/taskModel");


// Authenticate all CRUD protected endpoints with `jwtAuth` middleware
const passport = require("passport");
const jwtAuth = passport.authenticate("jwt", {session: false});


// GET all tasks, for Parent and Child user with particular family code.
router.get("/:familyCode", (req, res) => {
  Task.find({ familyCode: req.params.familyCode })
      .then((tasks) => {
        res.json(tasks.map(task => task.serialize()));
      })
      .catch(err =>{
        console.error(err);
        res.status(500).json({error: "Internal server error"});
      });
});

// POST task, for Parent User
router.post("/", jsonParser, (req, res) => {
  //console.log(req.body);
  let requiredFields = ["taskName", "familyCode"];

  for (let i = 0; i < requiredFields.length; i++) {
    let field = requiredFields[i];
    if (!(field in req.body)) {
      let message = `Missing \`${field}\`in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Task.create({
        taskName: req.body.taskName,
        familyCode: req.body.familyCode
      })
      .then(task => res.status(201).json(task.serialize()))
      .catch(err => {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      });
});

// DELETE task, for Parent User
router.delete("/:id", (req, res) => {
  Task.findByIdAndRemove(req.params.id)
      .then(() => {
        console.log(`Deleted task with id \`${req.params.id}\``);
        res.status(204).end();
      })
      .catch(err => {
        res.status(500).json({message: "Internal server error"});
      });
});

// PUT task, for Parent User
router.put("/:id", jsonParser, (req, res) => {
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
  let updateableFields = ["taskName"]; // update familyCode?

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Task
    /* all key/value pairs in toUpdate will be updated
    -- that's what `$set` does */
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(task => {
      // console.log(task); // the document with updated fields
      res.status(204).end();
    })
    .catch(err => res.status(500).json( {message: "Internal server error"} ));
});

module.exports = router;
