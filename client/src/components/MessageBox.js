// File: src/components/MessageBox.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPaperPlane } from "react-icons/fa";

const MessageBox = ({ caseId, onClose, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/api/cases/${caseId}/messages`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchMessages();
  }, [caseId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(`/api/cases/${caseId}/message`, {
        senderId: currentUser._id,
        senderName: currentUser.name,
        text: newMessage,
      });
      setMessages(res.data.messages);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-4 bg-white rounded-lg">
        <h2 className="mb-3 text-lg font-bold">Messages</h2>
        <div className="p-2 mb-3 overflow-y-auto border rounded max-h-64">
          {messages.length === 0 && <p className="text-gray-400">No messages yet.</p>}
          {messages.map((msg, idx) => (
            <div key={idx} className="mb-2">
              <strong>{msg.senderName}:</strong> <span>{msg.text}</span>
              <div className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow px-2 py-1 border rounded"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            onClick={handleSend}
            className="px-4 py-1 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            <FaPaperPlane />
          </button>
        </div>
        <button onClick={onClose} className="mt-4 text-sm text-red-600 hover:underline">
          Close
        </button>
      </div>
    </div>
  );
};

export default MessageBox;
