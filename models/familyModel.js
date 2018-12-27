const mongoose = require("mongoose");
require("./taskModel");
require("./prizeModel");

const familySchema = mongoose.Schema({
  familyCode: {
    type: String,
    required: true
  },
  tasksFinalized: {
    type: Boolean,
    required: true,
    default: false
  },
  currentTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "Task"
  }],
  currentPrize: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: "Prize"
  }
});

const Family = mongoose.model("Family", familySchema);
module.exports = { Family };


/*
Look up Tasks by familyCode:
Get familyCode, find family with familyCode in familyModel,
then return the current task(s)

For that family => currentTask

- When reset, empty out currentTasks
- When Finalize, set `tasksFinalized` to True
*/
