const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  book_id: {
    type: String,
    required: true,
    unique: true,
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: true,
  },

  author_id: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  isbn: String,
  genre: String,
  publication_date: Date,
  status: String,

  mrp: Number,
  author_royalty_per_copy: Number,
  total_copies_sold: Number,
  total_royalty_earned: Number,
  royalty_paid: Number,
  royalty_pending: Number,

  last_royalty_payout_date: Date,
  print_partner: String,
  available_on: [String],
});

module.exports = mongoose.model("Book", bookSchema);
