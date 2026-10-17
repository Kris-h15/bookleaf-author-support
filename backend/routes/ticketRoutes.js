const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Ticket = require("../models/Ticket");
const Author = require("../models/Author");

// Middlewares
const roleMiddleware = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

// Node Mailer
const sendEmail = require("../utils/sendEmail");

// Gemini AI
const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Open AI
// const OpenAI = require("openai");
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// for automatically deciding category of ticket raised by the author
const classifyTicket = require("../utils/classifyTicket");
const AIclassifyticket = require("../utils/AIclassifyticket");

// All tickets belonging to respective author
router.get(
  "/author/:authorId",
  authMiddleware,
  roleMiddleware("author"),
  async (req, res) => {
    try {
      // const { authorId } = req.params;

      // if (!mongoose.isValidObjectId(authorId)) {
      //   return res.status(400).json({ message: "Invalid author ID" });
      // }

      // const author = await Author.findById(authorId);

      // if (!author) {
      //   return res.status(404).json({ message: "Author not found" });
      // }

      // const tickets = await Ticket.find({ author: author._id })
      //   .select(
      //     "ticket_id subject description category priority status createdAt updatedAt messages",
      //   )
      //   .sort({ updatedAt: -1 });

      const authorId = req.user.id;
      const tickets = await Ticket.find({ author: authorId })
        .select(
          "ticket_id subject description category priority status createdAt updatedAt messages",
        )
        .sort({ updatedAt: -1 });

      res.json({ tickets });
    } catch (error) {
      console.error("Fetch tickets error:", error.message);
      res.status(500).json({ message: "Unable to fetch tickets" });
    }
  },
);

// Details of one ticket
router.get("/:ticketId", async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findOne({
      ticket_id: ticketId,
    }).populate("author", "author_id name email photoUrl");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({ ticket });
  } catch (error) {
    console.error("Ticket details error:", error.message);
    res.status(500).json({ message: "Unable to load ticket details" });
  }
});

// POST: Create a new ticket
router.post("/", async (req, res) => {
  try {
    const { authorId, subject, description, selectedBook } = req.body;

    if (
      !authorId ||
      !mongoose.isValidObjectId(authorId) ||
      !subject?.trim() ||
      !description?.trim()
    ) {
      return res.status(400).json({
        message: "Valid author, subject, and description are required",
      });
    }

    const author = await Author.findById(authorId);

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // decide category automatically
    const predictedCategory = classifyTicket(subject, description);
    let abcd;
    try {
      abcd = await AIclassifyticket(subject, description);
      console.log("AI classified it as:", abcd);
    } catch (error) {
      console.error("AI classification failed:", error.message);

      // Fallback to the rule-based predicted category
      abcd = predictedCategory;
    }

    const ticket = await Ticket.create({
      ticket_id: `BL-${Date.now()}`,
      book_name: selectedBook,
      author: author._id,
      subject: subject.trim(),
      description: description.trim(),
      messages: [
        {
          senderRole: "author",
          senderName: author.name,
          message: description.trim(),
        },
      ],
      category: predictedCategory,
      aiClassification: abcd,
    });

    res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("Create ticket error:", error.message);
    res.status(500).json({
      message: "Unable to create ticket",
    });
  }
});

// Add a reply to a ticket
router.post("/:ticketId/replies", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { authorId, message } = req.body;

    if (!authorId || !mongoose.isValidObjectId(authorId)) {
      return res.status(400).json({
        message: "A valid author ID is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Reply cannot be empty",
      });
    }

    const author = await Author.findById(authorId);

    if (!author) {
      return res.status(404).json({
        message: "Author not found",
      });
    }

    const ticket = await Ticket.findOne({
      ticket_id: ticketId,
      author: author._id,
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found for this author",
      });
    }

    ticket.messages.push({
      senderRole: "author",
      senderName: author.name,
      message: message.trim(),
    });

    // Reopen a resolved ticket when the author replies.
    if (["Resolved", "Closed"].includes(ticket.status)) {
      ticket.status = "Open";
    }

    await ticket.save();

    res.status(201).json({
      message: "Reply added successfully",
      ticket,
    });
  } catch (error) {
    console.error("Add reply error:", error.message);
    res.status(500).json({
      message: "Unable to add reply",
    });
  }
});

// Admin sends a reply to an author
router.post("/:ticketId/reply", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Reply cannot be empty",
      });
    }

    const ticket = await Ticket.findOne({
      ticket_id: ticketId,
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    ticket.messages.push({
      senderRole: "admin",
      senderName: "Admin",
      message: message.trim(),
    });

    await ticket.save();

    res.status(201).json({
      message: "Admin reply added successfully",
      ticket,
    });
  } catch (error) {
    console.error("Admin reply error:", error.message);

    res.status(500).json({
      message: "Unable to send admin reply",
    });
  }
});

//admin ticket queue with filter feature
router.get("/admin/all", async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;

    const filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (priority && priority !== "All") {
      filter.priority = priority;
    }

    if (search?.trim()) {
      const regex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );

      filter.$or = [
        { ticket_id: regex },
        { subject: regex },
        { description: regex },
      ];
    }

    const tickets = await Ticket.find(filter)
      .populate("author", "author_id name email photoUrl")
      .sort({ updatedAt: -1 });

    console.log(JSON.stringify(tickets, null, 2));
    res.json({ tickets });
  } catch (error) {
    console.error("Admin ticket queue error:", error.message);
    res.status(500).json({
      message: "Unable to load admin ticket queue",
    });
  }
});

// Admin updates ticket status and priority
router.patch("/admin/:ticketId", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, priority } = req.body;

    const allowedStatuses = [
      "Open",
      "In Progress",
      "Waiting for Author",
      "Resolved",
      "Closed",
    ];

    const allowedPriorities = ["Critical", "High", "Medium", "Low"];

    const updates = {};

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid ticket status",
        });
      }

      updates.status = status;
    }

    if (priority !== undefined) {
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          message: "Invalid ticket priority",
        });
      }

      updates.priority = priority;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide a status or priority to update",
      });
    }

    // Get the ticket before updating so we can compare old values.
    const oldTicket = await Ticket.findOne({ ticket_id: ticketId });

    if (!oldTicket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const oldStatus = oldTicket.status;
    const oldPriority = oldTicket.priority;

    // Update the ticket.
    const ticket = await Ticket.findOneAndUpdate(
      { ticket_id: ticketId },
      { $set: updates },
      { new: true, runValidators: true },
    ).populate("author", "author_id name email");

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    // Determine what actually changed.
    const statusChanged = status !== undefined && oldStatus !== ticket.status;

    const priorityChanged =
      priority !== undefined && oldPriority !== ticket.priority;

    // Send an email only if something actually changed.
    if ((statusChanged || priorityChanged) && ticket.author?.email) {
      const changes = [];

      if (statusChanged) {
        changes.push(`Status: ${oldStatus} → ${ticket.status}`);
      }

      if (priorityChanged) {
        changes.push(`Priority: ${oldPriority} → ${ticket.priority}`);
      }

      try {
        await sendEmail({
          to: ticket.author.email,
          subject: `BookLeaf Ticket Update: ${ticket.ticket_id}`,
          text: `
Hello ${ticket.author.name || "Author"},

Your BookLeaf support ticket has been updated by our support team.

Ticket ID: ${ticket.ticket_id}
Subject: ${ticket.subject}

Changes:
${changes.join("\n")}

Thank you,
BookLeaf Support
          `,
          html: `
            <h2>BookLeaf Ticket Update</h2>
            <p>Hello ${ticket.author.name || "Author"},</p>
            <p>Your support ticket has been updated by our support team.</p>
            <p><strong>Ticket ID:</strong> ${ticket.ticket_id}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>Changes:</strong></p>
            <ul>
              ${changes.map((change) => `<li>${change}</li>`).join("")}
            </ul>
            <p>Thank you,<br/>BookLeaf Support</p>
          `,
        });

        console.log("Ticket update email sent to:", ticket.author.email);
      } catch (emailError) {
        // An email failure should not undo a successful ticket update.
        console.error("Ticket update email failed:", emailError.message);
      }
    }

    res.json({
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error) {
    console.error("Admin update error:", error.message);

    res.status(500).json({
      message: "Unable to update ticket",
    });
  }
});

// Admin can send msg to another admin
router.post("/:id/internal-notes", async (req, res) => {
  try {
    console.log(req.params.id);
    const { message, admin } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Internal note cannot be empty",
      });
    }

    const ticket = await Ticket.findOne({
      ticket_id: req.params.id,
    });
    // console.log(ticket);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    ticket.internalNotes.push({
      message: message.trim(),
      admin: admin || "Admin",
      createdAt: new Date(),
    });

    await ticket.save();

    res.status(201).json({
      message: "Internal note added successfully",
      internalNotes: ticket.internalNotes,
    });
  } catch (error) {
    console.error("Error adding internal note:", error);

    res.status(500).json({
      message: "Failed to add internal note",
    });
  }
});

// AI-response Generation via Open-AI API
router.post("/:id/ai-draft", async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      ticket_id: req.params.id,
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const response = await ai.models.generateContent({
      // model: "gemini-2.5-flash",
      model: "gemini-3.8-flash",
      contents: `
        You are a professional customer support assistant
        for BookLeaf, a book publishing platform.

        Write a polite, helpful, concise reply to the author.
        Do not invent policies, account details, or actions.
        Ask for more information if necessary.
        Return only the suggested reply.

        Ticket subject: ${ticket.subject}
        Ticket description: ${ticket.description}
        Ticket category: ${ticket.category}
      `,
    });

    const draft = response.text?.trim();

    if (!draft) {
      return res.status(502).json({
        message: "AI did not return a reply",
      });
    }

    ticket.aiDraftResponse = draft;
    await ticket.save();

    res.status(200).json({
      message: "AI reply generated successfully",
      ticket_id: ticket.ticket_id,
      aiDraftResponse: draft,
    });
  } catch (error) {
    console.error("Gemini draft error:", error.message);

    res.status(500).json({
      message: `Failed to generate AI reply, ${error.message}`,
    });
  }
});

// Admin ticket analytics for Admin's dashboard
router.get("/admin/analytics", async (req, res) => {
  try {
    console.log("admin/analytics endpoint hit");
    const totalTickets = await Ticket.countDocuments();

    const openTickets = await Ticket.countDocuments({
      status: "Open",
    });

    const inProgressTickets = await Ticket.countDocuments({
      status: "In Progress",
    });

    const resolvedTickets = await Ticket.countDocuments({
      status: "Resolved",
    });

    const closedTickets = await Ticket.countDocuments({
      status: "Closed",
    });

    const highPriorityTickets = await Ticket.countDocuments({
      priority: "High",
    });

    res.status(200).json({
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      highPriorityTickets,
    });
  } catch (error) {
    console.error("Analytics error:", error);

    res.status(500).json({
      message: "Unable to fetch analytics",
    });
  }
});

// API for ticket category Decision Making
router.post("/AI-cat", async (req, res) => {
  try {
    let { text } = req.body;
    if (!text) {
      return res.status(404).json({
        message: "Subject & Description not Received at Api Endpoint",
      });
    }

    const response = await ai.models.generateContent({
      // model: "gemini-3.8-flash",
      model: "gemini-3.5-flash-lite",
      contents: `
      You are an AI ticket classification assistant for BookLeaf,
a book publishing platform.

Classify the following author support ticket into the most
appropriate category.

Available categories:
- Royalty & Payments
- ISBN & Metadata
- Printing & Quality
- Distribution
- Production Updates
- General

Category guidelines:
- Royalty & Payments: Missing payments, low royalties,
  incorrect calculations, payment delays.
- ISBN & Metadata: ISBN errors, book details, author name,
  title, description, or metadata changes.
- Printing & Quality: Poor printing, blurry images,
  damaged copies, misaligned pages.
- Distribution: Book unavailable on Amazon or other platforms,
  listing or distribution synchronization issues.
- Production Updates: Delays in typesetting, proofreading,
  printing, approvals, or production status.
- General: Questions or issues that do not fit other categories.

Rules:
1. Read the entire ticket carefully.
2. Select exactly one best-fitting category.
3. If no existing category fits, suggest a suitable new category.
4. If the ticket is unclear, choose General.
5. Do not invent information.
6. Return valid String only.

Ticket text:
"""
${text}
"""
      `,
    });

    const draft = response.text?.trim();

    if (!draft) {
      return res.status(502).json({
        message: "AI did not return a reply",
      });
    }

    res.status(200).json({
      message: "AI reply generated successfully",
      data: draft,
    });
  } catch (error) {
    console.error("Gemini draft error:", error.message);

    res.status(500).json({
      message: `Failed to generate AI reply, ${error.message}`,
    });
  }
});

module.exports = router;
