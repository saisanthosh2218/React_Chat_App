import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProfilePage.css";

const APIport = import.meta.env.VITE_LIVE_API_URL; // Change if using production server

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setFullName(parsedUser.fullName);
    setEmail(parsedUser.email);

    if (parsedUser.profileImage) {
      setPreviewImage(`${APIport}/${parsedUser.profileImage}`);
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await axios.put(
        `${APIport}/update-profile/${user._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update user in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="logo">
          <span className="chat-icon">💬</span>
          <h1>Chatty</h1>
        </div>
        <div className="nav-links">
          <Link to="/chat">💬 Chat</Link>
          <Link
            to="/"
            onClick={() => {
              localStorage.removeItem("user");
              // Optionally notify other tabs about logout
              window.dispatchEvent(new Event("storage"));
            }}
          >
            🚪 Logout
          </Link>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <h2>Profile</h2>
          <p className="profile-subtitle">Your profile information</p>

          {success && (
            <div className="success-message">
              <span className="success-icon">✓</span> {success}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="profile-image-container">
            <div className="profile-image">
              {previewImage ? (
                <img src={previewImage} alt="Profile" />
              ) : (
                <div className="profile-placeholder">
                  {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>
            <div className="profile-image-upload">
              <label htmlFor="profile-image-input" className="upload-button">
                <span className="camera-icon">📷</span>
              </label>
              <input
                type="file"
                id="profile-image-input"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <p>Click the camera icon to update your photo</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
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

            <div className="account-info">
              <h3>Account Information</h3>

              <div className="info-row">
                <div className="info-label">Member Since</div>
                <div className="info-value">
                  {
                    new Date(user.createdAt || Date.now())
                      .toISOString()
                      .split("T")[0]
                  }
                </div>
              </div>

              <div className="info-row">
                <div className="info-label">Account Status</div>
                <div className="info-value status-active">Active</div>
              </div>
            </div>

            <button type="submit" className="save-button" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
