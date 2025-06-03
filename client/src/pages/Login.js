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
      <div className="w-full max-w-md p-8 bg-white shadow-2xl sm:max-w-lg md:max-w-xl rounded-2xl sm:p-10 md:p-12">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-[#142a4f] tracking-tight">
          🔐 Welcome to Case Tracker
        </h2>

        {error && (
          <div className="mb-4 font-semibold text-center text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#d2ac68]"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#d2ac68]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#d2ac68] hover:bg-[#b89652] text-white font-bold py-3 text-lg rounded-md transition duration-300"
          >
            🚀 Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
