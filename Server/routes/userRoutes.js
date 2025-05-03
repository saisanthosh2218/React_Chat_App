const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  updateProfile, 
  getContacts,
  forgotPassword,
  resetPassword 
} = require("../controllers/userController");
const upload = require("../utils/upload");

// Register a new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Update user profile
router.put("/update-profile/:userId", upload.single("profileImage"), updateProfile);

// Get all contacts (users except the current user)
router.get("/contacts/:userId", getContacts);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

module.exports = router; 