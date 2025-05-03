const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/emailService");
// const { JWT_SECRET } = require("../config/config");
const path = require("path");
const fs = require("fs");

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return user data without password
    const userData = {
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profileImage: newUser.profileImage,
      createdAt: newUser.createdAt,
    };

    res.status(201).json({ user: userData, token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return user data without password
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    };

    res.json({ user: userData, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, email } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user data
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;

    // Update profile image if provided
    if (req.file) {
      // Delete old profile image if exists
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, "..", user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      user.profileImage = `uploads/${req.file.filename}`;
    }

    await user.save();

    // Return updated user data without password
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    };

    res.json({ user: userData });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all contacts (users except the current user)
const getContacts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all users except the current user
    const contacts = await User.find({ _id: { $ne: userId } }).select(
      "_id fullName email profileImage socketId lastSeen"
    );

    // Add online status
    const contactsWithStatus = contacts.map((contact) => ({
      _id: contact._id,
      fullName: contact.fullName,
      email: contact.email,
      profileImage: contact.profileImage,
      online: !!contact.socketId,
      lastSeen: contact.lastSeen,
    }));

    res.json(contactsWithStatus);
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const emailSent = await sendPasswordResetEmail(email, resetToken);
    if (!emailSent) {
      return res.status(500).json({ message: "Error sending email" });
    }

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  getContacts,
  forgotPassword,
  resetPassword
};
