const express = require("express");
const router = express.Router();

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { Task } = require("../models/taskModel");
const { User } = require("../models/userModel");
const { Family } = require("../models/familyModel");


// Authenticate all CRUD protected endpoints with `jwtAuth` middleware
const passport = require("passport");
const jwtAuth = passport.authenticate("jwt", {session: false});


// GET all tasks, for Parent and Child user with particular family code.
router.get("/:familyCode", jwtAuth, (req, res) => {
  /* Edited GET tasks route by `familyCode` to find Tasks using the
  Family model. The Family model has fields: `familycode`, `tasksFinalized`,
  and `currentTasks`. The Family model adds Task documents to the
  `currentTasks` field, then returns the current tasks for a Family. */
  Family.findOneAndUpdate(
    { familyCode: req.params.familyCode },
    { familyCode: req.params.familyCode },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  )
    .populate({
      path: "currentTasks",
      populate: {
        path: "completions"
      }
    })
    .exec()
    .then(family => {
      const tasks = family.currentTasks;
      return res.json(tasks.map(task => task.serialize(req.user)));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });

  // Task.find({ familyCode: req.params.familyCode })
  //   .populate("completions")
  //   .exec()
  //   .then(tasks => {
  //     // console.log("[[[ req.user.id ]]]", req.user.id);
  //     // console.log("[[[ TASKS ]]]", tasks)
  //     return res.json(tasks.map(task => task.serialize(req.user)));
  //     // res.json(tasks.map(task => task.taskCompletionsByUser));
  //   })
  //   .catch(err => {
  //     console.error(err);
  //     res.status(500).json({ error: "Internal server error" });
  //   });
});

// POST task, for Parent User
router.post("/", jsonParser, jwtAuth, (req, res) => {
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

  // Before Creating Task, make sure Family.tasksFinalized is not TRUE (false)
  return Family.findOneAndUpdate(
    { familyCode: req.body.familyCode },
    {
      $set: {
        familyCode: req.body.familyCode
      }
    },
    { new: true, upsert: true } // return the modified document rather than the original
  )
    .then(family => {
      if (family.tasksFinalized) {
        return res.status(500)
          .json({ message: "POST Task, tasksFinalized is already True." })
      }
    })
    .then(() => {
      let _task;
      return Task.create({
        taskName: req.body.taskName,
        familyCode: req.body.familyCode
      })
        .then(task => {
          const toPush = {
            $push: {
              currentTasks: task
            }
          };
          _task = task;
          const options = {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          };
          return Family.findOneAndUpdate(
            { familyCode: req.body.familyCode },
            toPush,
            options
          );
        })
        .then(() => res.status(201).json(_task.serialize()))
        .catch(err => {
          console.error(err);
          res.status(500).json({ message: "Internal server error" });
        });
    })
});

// DELETE task, for Parent User
router.delete("/:id", jwtAuth, (req, res) => {
  // Before Deleting Task, make sure Family.tasksFinalized is not TRUE (false)
  return Family.findOneAndUpdate(
    { familyCode: req.user.familyCode },
    {
      $set: { familyCode: req.user.familyCode }
    },
    { new: true, upsert: true }
  )
    .then(family => {
      if (family.tasksFinalized) {
        return res.status(500)
          .json({ message: "DELETE Task, tasksFinalized is already True" });
      }

      family.currentTasks = family.currentTasks.filter(taskId => 
        taskId.toString() !== req.params.id
      );

      // family.currentTasks = []; // Delete this later
      let saveFamily;
      return family.save()
        .then(_saveFamily => {
          saveFamily = _saveFamily;
          return Task.findByIdAndRemove(req.params.id)
          .then(() => {
            console.log(`Deleted task with id \`${req.params.id}\``);
            return res.status(204).end();
          })
          .catch(err => {
            return res.status(500).json({ message: "Internal server error" });
          });
        });

    })
    .catch(err => {
      return res.status(500).json({ message: "Internal server error" });
    });

});

// PUT task, for Parent User
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
  let updateableFields = ["taskName"]; // update familyCode?

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  // Before Updating TASK, make sure Family.tasksFinalized is not TRUE (false)

  /* The jwtAuth middleware contains info for req.user.
  It's unnecessary to pass user info for the PUT request. */
  console.log("[[[ REQ.USER.FAMILYCODE ]]]", req.user.familyCode);

  return Family.findOneAndUpdate(
    { familyCode: req.user.familyCode },
    {
      $set: { familyCode: req.user.familyCode }
    },
    { new: true, upsert: true }
  )
    .then(family => {
      if (family.tasksFinalized) {
        var response = res.status(500).json({ message: "PUT Task, tasksFinalized is already True" }); // this is where the response actually gets sent.
        return response; // this returns a value for the promise (Resolves) and exits the current function
      }

      return Task
      /* all key/value pairs in toUpdate will be updated
      -- that's what `$set` does */
        .findByIdAndUpdate(req.params.id, { $set: toUpdate })
        .then(task => {
          // console.log(task); // the document with updated fields
          return res.status(204).end();
        })
        .catch(err => {
          return res.status(500)
            .json({ message: "Internal server error" });
        });
    })
    .catch(err => {
      return res.status(500)
        .json({ message: "Internal server error" });
    });

});


// PUT task, for Child User
router.put("/:id/completed", jsonParser, jwtAuth, (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    let message = `Request path id (${req.params.id}) and ` +
                  `request body id (${req.body.id}) must match`;
    console.error(message);
    res.status(400).json( {message: message} );
  }

  console.log("[[[ REQ.BODY PUT REQUEST ]]]", req.body);

  /* The jwtAuth middleware contains info for req.user.
  It's unnecessary to pass user info for the PUT request. */
  console.log("[[[ REQ.USER ]]]", req.user);

  if (req.body.completed) {
    let toPush = {
      $push: {
        completions: {
          completedByUser: req.user.id
        }
      }
    };

    return Task.findByIdAndUpdate(req.params.id, toPush)
      .then(task => {
        console.log("[[[ TASK UPDATE, ADD CHECK TO BOX ]]]", task);
        return res.status(204).end()
      })
      .catch(err => res.status(500).json({ message: "Internal server error" }));
  }
  else {
    let toPull = {
      $pull: {
        completions: {
          completedByUser: req.user.id
        }
      }
    };

    return Task.findByIdAndUpdate(req.params.id, toPull)
      .then(task => {
        console.log("[[[ TASK UPDATE, REMOVE CHECK TO BOX ]]]", task)
        return res.status(204).end();
      })
      .catch(err => res.status(500).json({ message: "Internal server error" }));
  }
});


// PUT, Child notifies parent their task list is done
router.put("/request/review", jwtAuth, (req, res) => {
  let toUpdate = {
    /* Property in User model, indicates Child finished tasks.
    Parent can see which of their Child users finished all tasks.
    The approve child task button works, parent can award prize. */
    tasksReadyForReview: true
  };

  /* Although this is a PUT request to the Tasks route that shows the
  Child user finished all tasks, we need to use the User model to find
  which Child user finished the tasks. */
  return User.findByIdAndUpdate(req.user.id, { $set: toUpdate })
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});


// GET, Parent checks (or refreshes) if any children clicked the done button
router.get("/children/status", jwtAuth, (req, res) => {
  /* The logged in Parent grabs their familyCode.
  The family code is used to find all the Parent's Child users.
  The jwtAuth middleware contains info for req.user. */
  let familyCode = req.user.familyCode;

  /* Although this is a GET request to the Tasks route, we use the
  User model to find which Child user finished the tasks.
  The Parent user uses `familyCode` and `role: child` to find their
  Child users. */
  User.find({ familyCode, role: "child" })
    .then(users => {
      res.json({ users });
    })
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});


module.exports = router;
