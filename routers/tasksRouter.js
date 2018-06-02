const express = require("express");
const router = express.Router;

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const { Task } = require("../models");


// GET all tasks, for Parent and Child user with particular family code.
app.get("/:familyCode", (req, res) => {
  Task.find({ familyCode: req.params.familyCode })
      .then((tasks) => {
        res.json(tasks.map(task => task.serialize()));
      });
});

// POST task, for Parent User
app.post("/", jsonParser, (req, res) => {
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
app.delete("/:id", (req, res) => {
  Task.findByIdAndRemove(req.params.id)
      .then(() => {
        console.log(`Deleted task with id \`${req.params.id}\``);
        res.status(204).end();
      })
      .catch(err => {
        res.status(500).json({message: "Internal server error"});
      });
});

module.exports = router;




/***********************/

// // GET all tasks, for Parent and Child user with particular family code.
// app.get("/api/tasks/:familyCode", (req, res) => {
//   Task.find({ familyCode: req.params.familyCode })
//       .then((tasks) => {
//         res.json(tasks.map(task => task.serialize()));
//       });
// });

// // POST task, for Parent User
// app.post("/api/tasks", jsonParser, (req, res) => {
//   //console.log(req.body);
//   let requiredFields = ["taskName", "familyCode"];

//   for (let i = 0; i < requiredFields.length; i++) {
//     let field = requiredFields[i];
//     if (!(field in req.body)) {
//       let message = `Missing \`${field}\`in request body`;
//       console.error(message);
//       return res.status(400).send(message);
//     }
//   }

//   Task.create({
//         taskName: req.body.taskName,
//         familyCode: req.body.familyCode
//       })
//       .then(task => res.status(201).json(task.serialize()))
//       .catch(err => {
//         console.error(err);
//         res.status(500).json({ message: "Internal server error" });
//       });
// });

// // DELETE task, for Parent User
// app.delete("/api/tasks/:id", (req, res) => {
//   Task.findByIdAndRemove(req.params.id)
//       .then(() => {
//         console.log(`Deleted task with id \`${req.params.id}\``);
//         res.status(204).end();
//       })
//       .catch(err => {
//         res.status(500).json({message: "Internal server error"});
//       });
// });

