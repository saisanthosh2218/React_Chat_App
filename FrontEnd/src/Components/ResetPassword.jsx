import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css"; // Reuse the same styles

const APIport = import.meta.env.VITE_LIVE_API_URL || "http://localhost:7859";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${APIport}/reset-password`, {
        token,
        newPassword
      });
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

          <h2>Reset Password</h2>
          <p className="login-subtitle">Enter your new password</p>

          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword; 