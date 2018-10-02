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

/* mentor code */
// taskSchema.pre("find", function () {
//   this.populate("completedByUser")
// });
// taskSchema.pre("findOne", function () {
//   this.populate("completedByUser")
// });

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
