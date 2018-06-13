/* 'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''}
});

UserSchema.methods.serialize = function() {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || ''
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = {User}; */


const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  role: {type: String, required: true},
  username: {type: String, required: true /* , unique: true */},
  password: {type: String, required: true}, // password stored as HASH
  name: {type: String, required: true},
  familyCode: {type: String, required: true},
  completedTasks: [String], // not required, for Child user
  approved: {type: Boolean}, // not required, for Child user

  email: {type: String /* , unique: true */, required: true}
});

userSchema.methods.serialize = function () {
  return {
    id: this._id,
    role: this.role,
    username: this.username,
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

const User = mongoose.model("users", userSchema, "users");

module.exports = { User };
