const mongoose = require("mongoose");

const groupchatschema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: true,
  },
  name: { type: String, required: true },
  message: { type: String, requires: true },
});

module.exports = mongoose.model("Groupchat", groupchatschema);
