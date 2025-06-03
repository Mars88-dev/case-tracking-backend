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
    <div className="min-h-screen flex items-center justify-center bg-[#142a4f] px-4">
      <div className="w-full max-w-lg p-10 bg-white shadow-xl rounded-xl">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-[#142a4f]">
          🔐 Welcome to Case Tracker
        </h2>

        {error && <div className="mb-4 font-semibold text-center text-red-600">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d2ac68]"
            required
          />

          <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#d2ac68]"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#d2ac68] hover:bg-[#b89652] text-white font-bold py-3 rounded transition duration-300"
          >
            🚀 Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
