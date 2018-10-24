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
  assignedUsers: [
    { // this is one User
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "User"
    }
  ],
  completions: [
    {
      completedDate: {
        type: Date,
        default: null
      },
      completedByUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }
  ]
});

taskSchema.methods.serialize = function (reqUser) { // pass `req.user` to serialize
  console.log("[[[ serialize method taskSchema ]]]", reqUser);
  let completion = this.completions
      .find(task => task.completedByUser === reqUser.id);
  console.log("[[[ Child user completed task Y/N ]]]", completion);

  return {
    id: this._id,
    taskName: this.taskName,
    familyCode: this.familyCode,
    completions: this.completions, //Should completions be inside the virtual?

    // Chris A. bit of code
    // completedDate: null or some date value

    /*****
    * Need to add virtual method for completed by User, logged in user
    *****/
  };
};


// const Task = mongoose.model("tasks", taskSchema); // old code
const Task = mongoose.model("Task", taskSchema);

module.exports = { Task };
