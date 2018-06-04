const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
  taskName: {type: String, required: true},
  familyCode: {type: String, required: true}
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
