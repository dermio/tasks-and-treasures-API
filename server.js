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
  cors( {origin: CLIENT_ORIGIN} )
);

app.get("/api/endpoint_works", function (req, res) {
  res.json({ ok: true });
});


//GET all tasks, for Parent user with particular family code.
app.get("/api/tasks/:familyCode", (req, res) => {
  Task.find({familyCode: req.params.familyCode})
      .then((task) => {
        // console.log(task);
        // res.json(task);
        // res.json({ok: true});

        //res.json(task.map(task => task.apiRepr()));
        res.json(task);
      })
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
