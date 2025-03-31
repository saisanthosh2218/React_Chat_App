const express = require("express");
const router = express.Router();
const { getMessages, createMessage, uploadFile } = require("../controllers/messageController");
const upload = require("../utils/upload");

// Get messages between two users
router.get("/:senderId/:recipientId", getMessages);

// Create new message
router.post("/", upload.single("attachment"), createMessage);

// Upload file
router.post("/upload", upload.single("file"), uploadFile);

module.exports = router; 