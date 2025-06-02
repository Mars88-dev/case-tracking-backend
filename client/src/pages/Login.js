// src/pages/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "https://case-tracking-backend.onrender.com/api/auth/login",
        form
      );
      const { token } = res.data;
      localStorage.setItem("token", token);
      navigate("/"); // Navigate to dashboard
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-[#142a4f]">
          Login to Case Tracker
        </h2>

        {error && <div className="mb-4 text-center text-red-600">{error}</div>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 mb-6 border border-gray-300 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-[#142a4f] text-white p-2 rounded hover:bg-[#0f1e39]"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
