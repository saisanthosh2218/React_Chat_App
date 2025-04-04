import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

const APIport = import.meta.env.VITE_LIVE_API_URL || "http://localhost:7859"; 
console.log("Using API URL:", APIport); // Debugging

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for success message from registration
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Clear the state to prevent showing the message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending login request to:", `${APIport}/login`);
      const response = await axios.post(
        `${APIport}/login`, 
        {
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: false // Set to true if your server supports credentials with CORS
        }
      );

      console.log("Login response:", response.data);

      // Verify that we got a token in the response
      if (!response.data.token) {
        setError("Authentication failed: No token received from server");
        setLoading(false);
        return;
      }

      console.log("Login successful, received token");

      // Store both user and token in localStorage
      const userData = {
        ...response.data.user,
        token: response.data.token,
      };
      localStorage.setItem("user", JSON.stringify(userData));

      // Log before navigation
      console.log("About to navigate to /chat");
      
      // Trigger auth check event
      window.dispatchEvent(new Event("check-auth"));
      
      // Force a slight delay before navigation to ensure localStorage is updated
      setTimeout(() => {
        console.log("Navigating now...");
        navigate("/chat");
        
        // If still on login page after timeout, try direct window location change
        setTimeout(() => {
          if (window.location.pathname === '/' || window.location.pathname === '') {
            console.log("Still on login page, forcing navigation using window.location");
            window.location.href = '/#/chat';
          }
        }, 500);
      }, 100);
      
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
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
      <h1 className="under-development">The Application is under development. Please Bear with me😊</h1>

      <div className="login-form-container">

        <div className="login-form-content">
          <div className="login-icon">
            <span>💬</span>
          </div>

          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to your account</p>

          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
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

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="create-account">
            Don&apos;t have an account?{" "}
            <Link to="/register">Create account</Link>
          </div>

          <div className="welcome-message">
            <h3>Welcome back!</h3>
            <p>
              Sign in to continue your conversations and catch up with your
              messages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
