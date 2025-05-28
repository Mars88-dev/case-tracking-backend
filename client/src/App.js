// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import MyTransactions from "./components/MyTransactions";
import CaseDetail from "./components/CaseDetail";
import WeeklyReport from "./components/WeeklyReport";
import Login from "./pages/Login";
import Register from "./pages/Register";
import axios from "axios";

const BASE_URL = "https://case-tracking-backend.onrender.com";

function App() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Session expired or invalid token:", err);
        localStorage.removeItem("token");
        setUser(null);
      }
    };

    fetchUser();
  }, [token]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/mytransactions"
          element={user ? <MyTransactions /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/case/:id"
          element={user ? <CaseDetail /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/report/:id"
          element={user ? <WeeklyReport /> : <Navigate to="/login" replace />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
