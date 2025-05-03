const nodemailer = require('nodemailer');

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Function to send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.LOCAL_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your Chatty account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #d4a853;
        color: #1a1625;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br>Chatty Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail
}; 