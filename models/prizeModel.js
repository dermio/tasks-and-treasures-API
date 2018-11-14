const mongoose = require("mongoose");

const prizeSchema = mongoose.Schema({
  prizeName: {type: String, required: true},
  familyCode: {type: String, required: true}
});

prizeSchema.methods.serialize = function () {
  return {
    id: this._id,
    prizeName: this.prizeName,
    familyCode: this.familyCode
  };
};

const Prize = mongoose.model("Prize", prizeSchema);

module.exports = { Prize };
