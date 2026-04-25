const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      firstname: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
      },
      lastname: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 6,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 128,
    },
  },
  { timestamps: true },
);

const user = mongoose.model("user", userSchema);

module.exports = user;
