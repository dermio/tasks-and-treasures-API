const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  role: {type: String, required: true},
  username: {type: String, required: true /* , unique: true */},
  password: {type: String, required: true}, // password stored as HASH
  familyCode: {type: String, required: true},

  // The two fields are optional, not used in the Redux store for now.
  completedTasks: [String], // not required, for Child user
  approved: {type: Boolean}, // not required, for Child user

  tasksReadyForReview: Boolean, // for Child user

  email: {type: String /* , unique: true, required: true */}
});

userSchema.methods.serialize = function () {
  return {
    id: this._id,

    role: this.role,
    username: this.username,
    password: this.password, // Should hashed password be returned?
    familyCode: this.familyCode,

    // The two fields are optional, not used in the Redux store for now.
    completedTasks: this.completedTasks,
    approved: this.approved,

    tasksReadyForReview: this.tasksReadyForReview,

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

// const User = mongoose.model("users", userSchema, "users"); // old code
const User = mongoose.model("User", userSchema);

module.exports = { User };
