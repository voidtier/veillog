const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    type: String,
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    heading: String,
    text: String,
    date: String,
    time: String,
  },
  { timestamps: true },
);

const note = mongoose.model("note", noteSchema);

module.exports = note;
