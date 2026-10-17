// defining Schema for Author Model

const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  author_id: {
    type: String,
    required: true,
    unique: true,
  },
  photoUrl: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  phone: String,
  city: String,
  joined_date: Date,
});

module.exports = mongoose.model("Author", authorSchema);
