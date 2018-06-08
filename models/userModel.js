const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  role: {type: String, required: true},
  userName: {type: String, required: true, unique: true},
  password: {type: String, required: true}, // password stored as HASH
  name: {type: String, required: true},
  familyCode: {type: String, required: true},
  completedTasks: [String], // not required, for Child user
  approved: {type: Boolean}, // not required, for Child user

  email: {type: String, unique: true, required: true}
});

userSchema.methods.serialize = function () {
  return {
    id: this._id,
    role: this.role,
    userName: this.userName,
    password: this.password, // Should hashed password be returned?
    name: this.name,
    familyCode: this.familyCode,
    completedTasks: this.completedTasks,
    approved: this.approved,

    email: this.email
  };
};

// Auth code
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model("users", userSchema);

module.exports = { User };
