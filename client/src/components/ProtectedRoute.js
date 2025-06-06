// File: ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("https://case-tracking-backend.onrender.com/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        localStorage.setItem("user", JSON.stringify(res.data)); // 👈 save user data
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Token check failed:", err);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }

      setLoading(false);
    };

    checkToken();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
