// FULL FILE: src/components/Dashboard.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaComments } from "react-icons/fa";
import MessageBox from "./MessageBox";

const BASE_URL = "https://case-tracking-backend.onrender.com";
const COLORS = {
  primary: "#142a4f",
  accent: "#d2ac68",
  background: "#f5f5f5",
  white: "#ffffff",
  gray: "#f9fafb",
  border: "#cbd5e1",
  gold: "#d2ac68",
  blue: "#142a4f"
};

const TRANSFER_ITEMS = [
  "sellerFicaDocuments",
  "purchaserFicaDocuments",
  "titleDeed",
  "bondCancellationFigures",
  "municipalClearanceFigures",
  "transferDutyReceipt",
  "guaranteesFromBondAttorneys",
  "transferCost",
  "electricalComplianceCertificate",
  "municipalClearanceCertificate",
  "levyClearanceCertificate",
  "hoaCertificate"
];

const columns = [
  { key: "reference", label: "Reference" },
  { key: "date", label: "Date" },
  { key: "instructionReceived", label: "Instruction Received" },
  { key: "parties", label: "Parties" },
  { key: "agency", label: "Agency" },
  { key: "agent", label: "Agent" },
  { key: "purchasePrice", label: "Purchase Price" },
  { key: "property", label: "Property" },
  { key: "depositAmount", label: "Deposit Amount" },
  { key: "depositDueDate", label: "Deposit Due" },
  { key: "depositFulfilledDate", label: "Deposit Fulfilled" },
  { key: "bondAmount", label: "Bond Amount" },
  { key: "bondDueDate", label: "Bond Due" },
  { key: "bondFulfilledDate", label: "Bond Fulfilled" },
  ...TRANSFER_ITEMS.flatMap((item) => [
    {
      key: `${item}Requested`,
      label: (item === "electricalComplianceCertificate" ? "COC " : "") + item.replace(/([A-Z])/g, " $1").toUpperCase() + " - REQUESTED"
    },
    {
      key: `${item}Received`,
      label: (item === "electricalComplianceCertificate" ? "COC " : "") + item.replace(/([A-Z])/g, " $1").toUpperCase() + " - RECEIVED"
    }
  ]),
  { key: "transferSignedSellerDate", label: "Transfer Signed - Seller" },
  { key: "transferSignedPurchaserDate", label: "Transfer Signed - Purchaser" },
  { key: "documentsLodgedDate", label: "Docs Lodged" },
  { key: "deedsPrepDate", label: "Deeds Prep" },
  { key: "registrationDate", label: "Registration" },
  { key: "comments", label: "Comments" }
];

export default function Dashboard() {
  const [casesByUser, setCasesByUser] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortAZ, setSortAZ] = useState(false);
  const [filterOutstanding, setFilterOutstanding] = useState(false);
  const [colorPickIndex, setColorPickIndex] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [messageCounts, setMessageCounts] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchCases = useCallback(() => {
    if (!token) return;
    axios.get(`${BASE_URL}/api/cases`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(async (res) => {
      const userRes = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(userRes.data);

      let data = res.data;
      if (sortAZ) data = [...data].sort((a, b) => a.reference.localeCompare(b.reference));
      if (filterOutstanding) data = data.filter(c => !c.bondAmount || !c.depositAmount || !c.transferCostReceived);

      const grouped = data.reduce((acc, c) => {
        const user = c.createdBy?.username || "Unknown User";
        acc[user] = acc[user] || [];
        acc[user].push(c);
        return acc;
      }, {});
      setCasesByUser(grouped);

      const messagePromises = data.map(c =>
        axios.get(`${BASE_URL}/api/cases/${c._id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => ({ id: c._id, count: res.data.length })).catch(() => ({ id: c._id, count: 0 }))
      );
      const counts = await Promise.all(messagePromises);
      const countsMap = counts.reduce((acc, cur) => {
        acc[cur.id] = cur.count;
        return acc;
      }, {});
      setMessageCounts(countsMap);

    }).catch(console.error);
  }, [sortAZ, filterOutstanding, token]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleOpenMessages = (id) => {
    setSelectedCaseId(id);
    setMessageCounts(prev => ({ ...prev, [id]: 0 }));
  };
  const handleCloseMessages = () => setSelectedCaseId(null);

  const daysSince = (inputDate) => {
    if (!inputDate) return "—";
    const date = new Date(inputDate);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : "—";
  };

  const formatDate = (val) => {
    if (!val) return "—";
    const date = new Date(val);
    return !isNaN(date) ? date.toLocaleDateString("en-GB") : val;
  };

  const handleColorChange = async (caseId, color) => {
    try {
      const { data: existingCase } = await axios.get(`${BASE_URL}/api/cases/${caseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedColors = { ...existingCase.colors, daysSinceInstruction: color };
      await axios.put(`${BASE_URL}/api/cases/${caseId}`, { ...existingCase, colors: updatedColors }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCases();
    } catch (err) {
      console.error("Failed to update color:", err);
    }
  };

  const renderSection = (title, fields, data) => (
    <>
      <div style={{ gridColumn: "1 / -1", margin: "10px 0 4px", borderBottom: `2px solid ${COLORS.gold}`, paddingBottom: 4, fontWeight: "bold", fontSize: 14, color: COLORS.gold }}>{title}</div>
      {fields.map(({ key, label }) => (
        <div key={key} style={key === "comments" ? { gridColumn: "1 / -1" } : {}}>
          <div style={{ background: COLORS.primary, color: COLORS.white, padding: "6px 10px", borderRadius: 4, fontWeight: "bold" }}>{label}</div>
          <div style={{ border: `1px solid ${COLORS.border}`, padding: "6px 10px", borderRadius: 4, backgroundColor: data.colors?.[key] || COLORS.white }}>{formatDate(data[key])}</div>
        </div>
      ))}
    </>
  );

  return (
    <div style={{ background: COLORS.background, minHeight: "100vh", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <img src="/logo.png" alt="Logo" style={{ height: 90 }} />
        <h1 style={{ color: COLORS.primary, fontSize: 32 }}>Dashboard</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setSortAZ(!sortAZ)} style={{ padding: 8, borderRadius: 4 }}>Sort A-Z</button>
          <button onClick={() => setFilterOutstanding(!filterOutstanding)} style={{ padding: 8, borderRadius: 4 }}>Filter Outstanding</button>
          <button onClick={() => { setSortAZ(false); setFilterOutstanding(false); }} style={{ padding: 8, borderRadius: 4 }}>Reset</button>
        </div>
      </div>

      {Object.entries(casesByUser).map(([user, cases]) => (
        <section key={user} style={{ marginBottom: 32 }}>
          <h2 style={{ color: COLORS.primary, backgroundColor: COLORS.accent, padding: "10px 20px", borderRadius: 6 }}>{user}</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={{ width: 40, background: COLORS.primary, color: COLORS.white }}>#</th>
                  {"reference agent parties property".split(" ").map(key => (
                    <th key={key} style={{ padding: "12px 8px", background: COLORS.primary, color: COLORS.white, borderBottom: `2px solid ${COLORS.border}`, textAlign: "left" }}>{columns.find(c => c.key === key)?.label}</th>
                  ))}
                  <th style={{ padding: "12px 8px", background: COLORS.primary, color: COLORS.white }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c, i) => (
                  <React.Fragment key={c._id}>
                    <tr style={{ background: i % 2 === 0 ? COLORS.white : COLORS.gray, borderBottom: `2px solid #4b5563` }}>
                      <td
                        onClick={() => setColorPickIndex(colorPickIndex === c._id ? null : c._id)}
                        style={{ cursor: "pointer", padding: "6px 4px", backgroundColor: c.colors?.daysSinceInstruction || COLORS.primary, color: COLORS.white, fontWeight: "bold", fontSize: "11px", textAlign: "center", fontFamily: "monospace", letterSpacing: "1px", borderRadius: 4 }}>
                        {daysSince(c.instructionReceived)}
                      </td>
                      {["reference", "agent", "parties", "property"].map(key => (
                        <td key={key} style={{ padding: "10px 8px", backgroundColor: c.colors?.[key] || "inherit", wordBreak: "break-word" }}>{c[key] || "—"}</td>
                      ))}
                      <td style={{ padding: "10px 8px" }}>
                        <div style={{ display: "flex", gap: 6, position: "relative" }}>
                          <button onClick={() => navigate(`/case/${c._id}`)} style={{ background: COLORS.primary, color: COLORS.white, border: "none", padding: "6px 10px", borderRadius: 4 }}>Edit</button>
                          <button onClick={() => navigate(`/report/${c._id}`)} style={{ background: COLORS.accent, color: COLORS.primary, border: "none", padding: "6px 10px", borderRadius: 4 }}>Report</button>
                          <div style={{ position: "relative" }}>
                            <button onClick={() => handleOpenMessages(c._id)} style={{ background: COLORS.primary, color: COLORS.white, border: "none", padding: "6px 10px", borderRadius: 4 }}><FaComments /></button>
                            {messageCounts[c._id] > 0 && (
                              <span style={{ position: "absolute", top: 2, right: 2, width: 10, height: 10, borderRadius: "50%", backgroundColor: "red" }} />
                            )}
                          </div>
                          <button onClick={() => setExpandedRow(expandedRow === c._id ? null : c._id)} style={{ background: COLORS.primary, color: COLORS.white, border: "none", padding: "6px 10px", borderRadius: 4 }}>{expandedRow === c._id ? "Hide" : "View More"}</button>
                        </div>
                      </td>
                    </tr>
                    {colorPickIndex === c._id && (
                      <tr>
                        <td colSpan={6}><div style={{ padding: 10, display: "flex", alignItems: "center", gap: 10, background: COLORS.gray }}>
                          <label>Pick a highlight color:</label>
                          <input type="color" onChange={e => handleColorChange(c._id, e.target.value)} value={c.colors?.daysSinceInstruction || "#ffffff"} />
                          <button onClick={() => handleColorChange(c._id, "")} style={{ padding: "4px 8px" }}>Reset</button>
                          <button onClick={() => setColorPickIndex(null)} style={{ padding: "4px 8px" }}>Close</button>
                        </div></td>
                      </tr>
                    )}
                    {expandedRow === c._id && (
                      <tr style={{ background: COLORS.gray }}>
                        <td colSpan={6} style={{ padding: 16 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                            {renderSection("Information", columns.filter(col => ["reference", "instructionReceived", "date", "parties", "agency", "agent", "purchasePrice", "property"].includes(col.key)), c)}
                            {renderSection("Financials", columns.filter(col => ["depositAmount", "bondAmount", "depositDueDate", "depositFulfilledDate", "bondDueDate", "bondFulfilledDate"].includes(col.key)), c)}
                            {renderSection("TRANSFER PROCESS - REQUESTED", columns.filter(col => col.key.includes("Requested")), c)}
                            {renderSection("TRANSFER PROCESS - RECEIVED", columns.filter(col => col.key.includes("Received") && col.key !== "instructionReceived"), c)}
                            {renderSection("Transfer Signed", columns.filter(col => col.key.includes("transferSigned")), c)}
                            {renderSection("Deeds Office", columns.filter(col => col.key.includes("documentsLodgedDate") || col.key.includes("deedsPrepDate") || col.key.includes("registrationDate")), c)}
                            {renderSection("Comments", columns.filter(col => col.key === "comments"), c)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {selectedCaseId && currentUser && (
        <MessageBox
          caseId={selectedCaseId}
          onClose={handleCloseMessages}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
