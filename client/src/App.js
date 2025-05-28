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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {token ? (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mytransactions" element={<MyTransactions />} />
            <Route path="/case/:id" element={<CaseDetail />} />
            <Route path="/report/:id" element={<WeeklyReport />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
