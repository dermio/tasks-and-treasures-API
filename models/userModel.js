const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  role: {type: String, required: true},
  userName: {type: String, required: true},
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
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};


const User = mongoose.model("users", userSchema);

module.exports = { User };
