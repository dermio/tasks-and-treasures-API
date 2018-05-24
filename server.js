const express = require("express");
const app = express();

const cors = require("cors");
const { CLIENT_ORIGIN } = require("./config");

const PORT = process.env.PORT || 8080;

app.get("/api/*", function (req, res) {
  res.json({ ok: true });
});

app.listen(PORT, (req, res) => {
  console.log(`Listening on port ${PORT}`);
});

module.exports = {app};
