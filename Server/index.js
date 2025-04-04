const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const socketIO = require("socket.io");
const mongoose = require("mongoose");


// Import routes
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Import socket handler
const socketHandler = require("./socket/socketHandler");

// Import message controller to share the io instance
const messageController = require("./controllers/messageController");

const app = express();
const port = process.env.PORT;
const server = http.createServer(app);

app.use(
  cors({
    origin: [
      process.env.LOCAL_URL,
      process.env.LIVE_URL
    ],
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_LIVE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Use routes
app.use("/", userRoutes);
app.use("/messages", messageRoutes);

// Socket.IO Setup
const io = socketIO(server, {
  cors: {
    origin: [
      process.env.LOCAL_URL,
      process.env.LIVE_URL
    ],
    methods: ["GET", "POST"],
  },
});

// Share the io instance with message controller
messageController.setIo(io);

// Initialize socket handler
socketHandler(io);

// Start Server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
