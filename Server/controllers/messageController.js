const Message = require("../models/Message");
const User = require("../models/User");

// Socket.io reference for emitting events
let io = null;

// Set the io instance
const setIo = (ioInstance) => {
  io = ioInstance;
};

// Get messages between two users
const getMessages = async (req, res) => {
  try {
    const { senderId, recipientId } = req.params;
    
    // Find messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId }
      ]
    }).sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new message
const createMessage = async (req, res) => {
  try {
    const { sender, recipient, text } = req.body;
    
    const newMessage = new Message({
      sender,
      recipient,
      text: text || "",
      attachment: req.file ? `uploads/${req.file.filename}` : null,
      timestamp: new Date()
    });
    
    const savedMessage = await newMessage.save();
    
    // Emit the message via socket immediately - we don't need to query users first
    if (io) {
      io.emit("newMessage", savedMessage);
      console.log(`Broadcast message to all clients with ID: ${savedMessage._id}`);
    }
    
    // Send response immediately
    res.status(201).json(savedMessage);
    
    // Do any additional logging after responding to client
    if (io) {
      try {
        // Find recipient and sender information for logging only (non-blocking)
        const [recipientUser, senderUser] = await Promise.all([
          User.findById(recipient).select('fullName').lean(),
          User.findById(sender).select('fullName').lean()
        ]);
        
        console.log(`Sent message from ${senderUser?.fullName} to ${recipientUser?.fullName}`);
      } catch (error) {
        console.error("Error fetching user details for logging:", error);
      }
    }
  } catch (error) {
    console.error("Create message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload file
const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    res.json({ filePath: `uploads/${req.file.filename}` });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMessages,
  createMessage,
  uploadFile,
  setIo
}; 