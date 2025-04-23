import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", { username, email, password });
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1>Register</h1>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Register</button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    display: "flex", justifyContent: "center", alignItems: "center",
    minHeight: "80vh", background: "#f5f5f5"
  },
  form: {
    background: "#fff", padding: 30, borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: 320
  },
  input: {
    width: "100%", padding: "10px", marginBottom: 20,
    borderRadius: 4, border: "1px solid #ccc"
  },
  button: {
    width: "100%", padding: "12px", background: "#142a4f",
    color: "#fff", border: "none", borderRadius: 4, cursor: "pointer"
  }
};
