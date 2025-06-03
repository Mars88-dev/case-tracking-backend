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
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>🔐 Welcome to Case Tracker</h1>

        {error && <div style={styles.error}>{error}</div>}

        <input
          placeholder="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          placeholder="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>🚀 Login</button>
      </form>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#f5f5f5",
    padding: "0 16px"
  },
  form: {
    background: "#ffffff",
    padding: 30,
    borderRadius: 10,
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)"
  },
  title: {
    textAlign: "center",
    marginBottom: 25,
    color: "#142a4f",
    fontSize: 24
  },
  error: {
    color: "red",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "500"
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 20,
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 14
  },
  button: {
    width: "100%",
    padding: 12,
    background: "#142a4f",
    color: "#ffffff",
    border: "none",
    borderRadius: 5,
    fontSize: 16,
    cursor: "pointer"
  }
};

export default Login;
