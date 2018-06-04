const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  role: {type: String, required: true},
  userName: {type: String, required: true},
  password: {type: String, required: true}, // password stored as HASH
  name: {type: String, required: true},
  familyCode: {type: String, required: true},
  completedTasks: [String], // not required, for Child user
  approved: {type: Boolean} // not required, for Child user
});

userSchema.methods.serialize = function () {
  return {
    id: this._id,
    role: this.role,
    userName: this.userName,
    password: this.password,
    name: this.name,
    familyCode: this.familyCode,
    completedTasks: this.completedTasks,
    approved: this.approved
  };
};

const User = mongoose.model("users", userSchema);

module.exports = { User };
