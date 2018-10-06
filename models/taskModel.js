const mongoose = require("mongoose");

// Need to require User model or the ref and populate() won't work
const User = require("./userModel");

const taskSchema = mongoose.Schema({
  taskName: {
    type: String,
    required: true
  },
  familyCode: {
    type: String,
    required: true
  },
  dueDate: {
    // compare End to Start date, also see Mongoose timestamps option
    type: Date,
    default: Date.now()
  },
  completedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "User"
  },
  completedDate: {
    type: Date,
    default: null
  }
});

taskSchema.methods.serialize = function () {
  return {
    id: this._id,
    taskName: this.taskName,
    familyCode: this.familyCode,
    completedDate: this.completedDate,
    completedByUser: this.completedByUser
  };
};

// const Task = mongoose.model("tasks", taskSchema); // old code
const Task = mongoose.model("Task", taskSchema);

module.exports = { Task };
