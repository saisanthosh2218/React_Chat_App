import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css"; // Reuse the same styles

const APIport = import.meta.env.VITE_LIVE_API_URL || "http://localhost:7859";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${APIport}/forgot-password`, { email });
      setSuccess("Password reset instructions have been sent to your email");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="logo">
          <span className="chat-icon">💬</span>
          <h1>Chatty</h1>
        </div>
      </div>

      <div className="login-form-container">
        <div className="login-form-content">
          <div className="login-icon">
            <span>🔑</span>
          </div>

          <h2>Forgot Password</h2>
          <p className="login-subtitle">Enter your email to reset your password</p>

          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@email.com"
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="create-account">
            Remember your password? <Link to="/">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 