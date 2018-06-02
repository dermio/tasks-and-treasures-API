const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const cors = require("cors");
const { CLIENT_ORIGIN, PORT, DATABASE_URL } = require("./config");
const { Task } = require("./models");

mongoose.Promise = global.Promise;

app.use(
  cors({ origin: CLIENT_ORIGIN })
);


// GET all tasks, for Parent and Child user with particular family code.
app.get("/api/tasks/:familyCode", (req, res) => {
  Task.find({ familyCode: req.params.familyCode })
      .then((task) => {
        console.log(task);
        // res.json(task.map(task => task.apiRepr()));
        res.json(task);
      })
});

// POST task, for Parent User
app.post("/api/task", jsonParser, (req, res) => {
  console.log(req.body);
  let requiredFields = ["taskName", "familyCode"];

  for (let i = 0; i < requiredFields.length; i++) {
    let field = requiredFields[i];
    if (!(field in req.body)) {
      let message = `Missing \`${field}\`in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  // Need to check family code

  Task.create({
    taskName: req.body.taskName,
    familyCode: req.body.familyCode
  })
    .then(task => res.status(201).json());
});


/* closeServer needs access to a server object, but that only
gets created when `runServer` runs, so we declare `server` here
and then assign a value to it in run */
let server;

/* this function connects to our database, then starts the server */
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on("error", err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

/* this function closes the server, and returns a promise. we'll
use it in our integration tests later. */
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

/* if server.js is called directly (aka, with `node server.js`),
this block runs. but we also export the runServer command so other code
(for instance, test code) can start the server as needed. */
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };