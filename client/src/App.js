// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import MyTransactions from "./components/MyTransactions";
import CaseDetail from "./components/CaseDetail";
import WeeklyReport from "./components/WeeklyReport";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const token = localStorage.getItem("token");

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
          element={token ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/mytransactions"
          element={token ? <MyTransactions /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/case/:id"
          element={token ? <CaseDetail /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/report/:id"
          element={token ? <WeeklyReport /> : <Navigate to="/login" replace />}
        />

        {/* Catch-all fallback to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
