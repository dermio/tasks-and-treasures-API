const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
  taskName: {
    type: String,
    required: true
  },
  familyCode: {
    type: String,
    required: true
  },
  // - completed at Date, expiration date,
  // - completed by User, need Ref to user table
  dueDate: {
    // compare End to Start date, also see Mongoose timestamps option
    type: Date,
    default: Date.now
  },
  completedByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  completed: {
    type: Boolean,
    default: false
  }
});

taskSchema.methods.serialize = function () {
  return {
    id: this._id,
    taskName: this.taskName,
    familyCode: this.familyCode
  };
};

const Task = mongoose.model("tasks", taskSchema);

module.exports = { Task };
