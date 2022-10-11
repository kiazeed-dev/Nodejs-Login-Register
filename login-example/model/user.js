const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    question: { type: String, required: true },
    anwser: { type: String, required: true }
  },
  { collection: "users" }
);

const model = mongoose.model("UserSchema", UserSchema);
module.exports = model;
