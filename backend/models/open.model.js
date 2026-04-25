const mongoose = require("mongoose");

const openSchema = new mongoose.Schema(
  {
    type: String,
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    heading: String,
    openLink: String,
    date: String,
    time: String,
  },
  { timestamps: true },
);

const open = mongoose.model("open", openSchema);

module.exports = open;
