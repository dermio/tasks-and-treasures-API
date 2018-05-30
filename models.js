const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
  taskName: {type: String, required: true},
  familyCode: {type: String, required: true}
});

const prizeSchema = mongoose.Schema({
  prizeName: {type: String, required: true},
  familyCode: {type: String, required: true}
});

const parentUser = mongoose.Schema({
  role: {type: String, required: true},
  userName: {type: String, required: true},
  password: {type: String, required: true}, // password stored as HASH
  name: {type: String, required: true},
  familyCode: {type: String, required: true}
});

const childUser = mongoose.Schema({
  role: {type: String, required: true},
  userName: {type: String, required: true},
  password: {type: String, required: true}, // password stored as HASH
  name: {type: String, required: true},
  familyCode: {type: String, required: true},
  completed_tasks: [String], // not required, list might be empty
  approved: {type: Boolean, required: true}
});


const Task = mongoose.model("Task", taskSchema);

module.exports = { Task };
