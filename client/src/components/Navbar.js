// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>Gerhard Barnard Inc.</div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Dashboard</Link>
        {token && <Link to="/mytransactions" style={styles.link}>My Transactions</Link>}
        {token ? (
          <button onClick={handleLogout} style={styles.button}>Logout</button>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.button}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#142a4f",
    color: "#ffffff",
  },
  logo: { fontSize: 20, fontWeight: "bold" },
  links: { display: "flex", gap: 15, alignItems: "center" },
  link: { color: "#ffffff", textDecoration: "none", fontSize: 14 },
  button: {
    padding: "6px 12px",
    backgroundColor: "#d2ac68",
    color: "#142a4f",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 14,
    textDecoration: "none",
  },
};
