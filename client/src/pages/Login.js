import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("https://case-tracking-backend.onrender.com/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Login</h1>

        {error && <div style={styles.error}>{error}</div>}

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#f5f5f5"
  },
  form: {
    background: "#ffffff",
    padding: 30,
    borderRadius: 10,
    width: 340,
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
