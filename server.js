const express = require("express");
const app = express();
const mongoose = require("mongoose");

const cors = require("cors");
const { CLIENT_ORIGIN, PORT, DATABASE_URL } = require("./config");

app.use(
  cors( {origin: CLIENT_ORIGIN} )
);

app.get("/api/*", function (req, res) {
  res.json({ ok: true });
});

app.listen(PORT, (req, res) => {
  console.log(`Listening on port ${PORT}`);
});

module.exports = {app};
