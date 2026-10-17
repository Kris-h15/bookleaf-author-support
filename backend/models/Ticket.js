const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: String,
      unique: true,
      required: true,
    },

    book_name: {
      type: String,
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Royalty",
        "Publishing",
        "Book Changes",
        "Marketing",
        "Distribution",
        "Other",
      ],
      default: "Other",
    },

    priority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Waiting for Author", "Resolved", "Closed"],
      default: "Open",
    },

    assignedTo: {
      type: String,
      default: null,
    },

    messages: [
      {
        senderRole: {
          type: String,
          enum: ["author", "admin"],
          required: true,
        },
        senderName: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    aiDraftResponse: {
      type: String,
      default: "",
    },

    aiClassification: {
      type: String,
      default: "",
    },

    aiPriority: {
      type: String,
      default: "",
    },

    // will contain the msgs between admins (should not visible to author)
    internalNotes: [
      {
        message: {
          type: String,
          required: true,
          trim: true,
        },
        admin: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ticket", ticketSchema);
