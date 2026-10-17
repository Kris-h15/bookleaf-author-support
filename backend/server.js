const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Ticket = require("./models/Ticket");

// To connect to db using connection string
const connectDB = require("./config/db");

// Socket.io =================================================
const http = require("http");
const { Server } = require("socket.io");

// ==============================================================
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Homepage");
});

// Authentication Route
app.use("/api/auth", require("./routes/authRoutes"));

// authorRoute
app.use("/api/authors", require("./routes/authorRoutes"));

// ticket route
app.use("/api/tickets", require("./routes/ticketRoutes"));

const startServer = async () => {
  await connectDB();

  // app.listen(PORT, () => {
  //   console.log(`Listening at port : ${PORT}`);
  // });
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PATCH"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // socket connections from here ========
    // join room
    socket.on("join-ticket", (ticketId) => {
      socket.join(`ticket:${ticketId}`);
      console.log(`${socket.id} joined ticket:${ticketId}`);
    });

    // Receive a message event and broadcast it
    socket.on("msg", (data) => {
      const { ticketId } = data;

      // Send the saved message to the OTHER users
      // in this ticket room, not back to the sender.
      socket.to(`ticket:${ticketId}`).emit("new-message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
