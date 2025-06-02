// FULL FILE: src/components/Cases.js (UPDATED FOR ACTIVE STATUS DISPLAY)
import React, { useRef, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "axios";

const BASE_URL = "https://case-tracking-backend.onrender.com";

const Cases = () => {
  const reportRef = useRef(null);
  const [cases, setCases] = useState([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/cases`);
        setCases(res.data);
      } catch (err) {
        console.error("Failed to fetch cases", err);
      }
    };

    fetchCases();
  }, []);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: "Case Report",
    onBeforePrint: () => console.log("🟢 Preparing PDF..."),
    onAfterPrint: () => console.log("✅ PDF Successfully Printed!"),
  });

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Cases</h1>

      <div ref={reportRef} style={{ padding: "20px", border: "2px solid black", background: "white" }}>
        <h2>Case Report</h2>
        {cases.length === 0 ? (
          <p>No cases available.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid black", padding: "8px" }}>Reference</th>
                <th style={{ border: "1px solid black", padding: "8px" }}>Agent</th>
                <th style={{ border: "1px solid black", padding: "8px" }}>Active</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c._id} style={{ opacity: c.isActive ? 1 : 0.4 }}>
                  <td style={{ border: "1px solid black", padding: "8px" }}>{c.reference}</td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>{c.agent}</td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>{c.isActive ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button onClick={handlePrint} style={{ marginTop: "20px", padding: "10px", background: "blue", color: "white" }}>
        Download Report as PDF
      </button>
    </div>
  );
};

export default Cases;
