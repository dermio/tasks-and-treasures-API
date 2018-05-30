const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
  taskName: {type: String, required: true},
  familyCode: {type: String, required: true}
});

const prizeSchema = mongoose.Schema({
  prizeName: {type: String, required: true},
  familyCode: {type: String, required: true}
});



