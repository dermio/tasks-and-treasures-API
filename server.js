const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const passport = require("passport");
require("dotenv").config();

const cors = require("cors");
const { CLIENT_ORIGIN, PORT, DATABASE_URL, SECRET } = require("./config");

const tasksRouter = require("./routers/tasksRouter");
const prizesRouter = require("./routers/prizesRouter");

const usersRouter = require("./routers/usersRouter");

mongoose.Promise = global.Promise;

// Logging
app.use(morgan("common"));

// CORS
app.use( cors({ origin: CLIENT_ORIGIN }) );

app.use("/api/tasks", tasksRouter);
app.use("/api/prizes", prizesRouter);

app.use("/api/users", usersRouter);

/****************************
 * Related to Auth, C.K.
****************************/



/****************************
 * Related to Auth
****************************/


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
