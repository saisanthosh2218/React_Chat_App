import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginPage from "./Components/LoginPage";
import RegisterPage from "./Components/RegisterPage";
import ProfilePage from "./Components/ProfilePage";
import NewChatPage from "./Components/NewChatPage";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is logged in with a valid token
    const checkAuth = () => {
      console.log("Checking authentication status");
      const userStr = localStorage.getItem("user");
      console.log("User data in localStorage:", userStr ? "exists" : "does not exist");
      
      if (!userStr) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const user = JSON.parse(userStr);
        // Check if the user object contains a token
        if (!user || !user.token) {
          console.warn("Invalid user data or missing token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          return;
        }

        // Token exists
        console.log("Found valid token in localStorage, user is authenticated");
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
      } catch (error) {
        // If there's an error parsing the JSON or any other issue
        console.error("Auth check error:", error);
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    // Listen for storage events (logout in other tabs)
    window.addEventListener("storage", checkAuth);
    // Add a custom event for checking auth
    window.addEventListener("check-auth", checkAuth);
    
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("check-auth", checkAuth);
    };
  }, []);

  // Protected route component
  // eslint-disable-next-line react/prop-types
  const ProtectedRoute = ({ children }) => {
    if (isCheckingAuth) {
      // Show loading indicator while checking auth
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          Loading...
        </div>
      );
    }

    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      return <Navigate to="/" />;
    }

    console.log("User authenticated, rendering protected route");
    return children;
  };

  return (

    
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <NewChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </BrowserRouter>
    );
};

export default App;
