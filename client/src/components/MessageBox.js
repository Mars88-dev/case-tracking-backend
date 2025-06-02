// File: src/components/MessageBox.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

const BASE_URL = "https://case-tracking-backend.onrender.com";
const COLORS = {
  navy: "#142a4f",
  gold: "#d2ac68",
  background: "#f5f5f5",
  white: "#ffffff"
};

export default function MessageBox({ caseId, onClose, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/cases/${caseId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        setMessages(res.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSubmit = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post(
        `${BASE_URL}/api/cases/${caseId}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await axios.delete(
        `${BASE_URL}/api/cases/${caseId}/messages/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchMessages();
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };  

  useEffect(() => {
    fetchMessages();
  }, [caseId]);

  return (
    <div style={{
      position: "fixed",
      top: 50,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      width: 500,
      maxHeight: "80vh",
      overflowY: "auto",
      backgroundColor: COLORS.white,
      border: `2px solid ${COLORS.gold}`,
      borderRadius: 8,
      padding: 16,
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      fontFamily: "Arial, sans-serif"
    }}>
      <h3 style={{ marginTop: 0, color: COLORS.navy }}>💬 Messages for this Transaction</h3>

      <div style={{ maxHeight: "50vh", overflowY: "auto", marginBottom: 12 }}>
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg._id} style={{
              background: COLORS.background,
              padding: "10px 12px",
              marginBottom: 10,
              borderRadius: 6,
              border: `1px solid ${COLORS.navy}`,
              position: "relative"
            }}>
              <strong style={{ color: COLORS.navy }}>{msg.username}</strong>
              <div style={{ marginTop: 4, marginBottom: 6 }}>{msg.content}</div>
              <small style={{ color: "#555" }}>{new Date(msg.createdAt).toLocaleString()}</small>
              {currentUser?.username === msg.username && (
                <button onClick={() => handleDelete(msg._id)} style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#e53e3e"
                }}>
                  <FaTrash />
                </button>
              )}
            </div>
          ))
        ) : (
          <p style={{ color: COLORS.navy }}>No messages yet.</p>
        )}
      </div>

      <textarea
        rows={3}
        placeholder="Type your message here..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 6,
          border: `1px solid ${COLORS.gold}`,
          marginBottom: 10,
          resize: "none"
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={handleSubmit}
          style={{
            background: COLORS.navy,
            color: COLORS.white,
            padding: "8px 18px",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          ➤ Send
        </button>
        <button
          onClick={onClose}
          style={{
            background: "#e53e3e",
            color: "#fff",
            padding: "8px 18px",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          ✖ Close
        </button>
      </div>
    </div>
  );
}
