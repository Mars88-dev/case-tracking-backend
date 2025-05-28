// File: src/components/MyTransaction.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    { key: `${item}Requested`, label: (item === "electricalComplianceCertificate" ? "COC " : "") + item.replace(/([A-Z])/g, " $1").toUpperCase() + " - REQUESTED" },
    { key: `${item}Received`, label: (item === "electricalComplianceCertificate" ? "COC " : "") + item.replace(/([A-Z])/g, " $1").toUpperCase() + " - RECEIVED" }
  ]),
  { key: "transferSignedSellerDate", label: "Transfer Signed - Seller" },
  { key: "transferSignedPurchaserDate", label: "Transfer Signed - Purchaser" },
  { key: "documentsLodgedDate", label: "Docs Lodged" },
  { key: "deedsPrepDate", label: "Deeds Prep" },
  { key: "registrationDate", label: "Registration" },
  { key: "comments", label: "Comments" }
];

const daysSince = (dateStr) => {
  if (!dateStr) return "—";
  const isoParsed = new Date(dateStr);
  if (!isNaN(isoParsed)) {
    const now = new Date();
    const diff = Math.floor((now - isoParsed) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : "—";
  }
  const [day, month, year] = dateStr.split("/");
  const fallbackDate = new Date(`${year}-${month}-${day}`);
  if (isNaN(fallbackDate)) return "—";
  const now = new Date();
  const diff = Math.floor((now - fallbackDate) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : "—";
};

const formatDate = (val) => {
  if (!val) return "—";
  const date = new Date(val);
  return !isNaN(date) ? date.toLocaleDateString("en-GB") : val;
};

const renderSection = (title, fields, data) => (
  <>
    <div style={{ gridColumn: "1 / -1", margin: "10px 0 4px", borderBottom: `2px solid ${COLORS.gold}`, paddingBottom: 4, fontWeight: "bold", fontSize: 15, color: COLORS.gold, fontFamily: 'Segoe UI' }}>{title}</div>
    {fields.map(({ key, label }) => (
      <div key={key} style={key === "comments" ? { gridColumn: "1 / -1" } : {}}>
        <div style={{ background: COLORS.primary, color: COLORS.white, padding: '6px 10px', borderRadius: 4, fontWeight: 600, fontSize: 14, fontFamily: 'Segoe UI' }}>{label}</div>
        <div style={{ border: `1px solid ${COLORS.border}`, padding: '8px 10px', borderRadius: 4, backgroundColor: data.colors?.[key] || COLORS.white, fontSize: 15, fontFamily: 'Segoe UI' }}>{formatDate(data[key])}</div>
      </div>
    ))}
  </>
);

export default function MyTransaction() {
  const [cases, setCases] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortAZ, setSortAZ] = useState(true); // Default sorting A-Z ON
  const [filterOutstanding, setFilterOutstanding] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    axios.get(`${BASE_URL}/api/mycases`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      let data = res.data;
      if (sortAZ) data = [...data].sort((a, b) => a.reference.localeCompare(b.reference));
      if (filterOutstanding) data = data.filter(c => !c.bondAmount || !c.depositAmount);
      setCases(data);
    }).catch(console.error);
  }, [sortAZ, filterOutstanding, token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/cases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCases(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete the transaction.");
    }
  };

  return (
    <div style={{ background: COLORS.background, minHeight: '100vh', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <img src="/logo.png" alt="Logo" style={{ height: 90 }} />
        <h1 style={{ color: COLORS.primary, fontSize: 32 }}>My Transactions</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setSortAZ(!sortAZ)} style={{ padding: 8, borderRadius: 4 }}>Sort A-Z</button>
          <button onClick={() => setFilterOutstanding(!filterOutstanding)} style={{ padding: 8, borderRadius: 4 }}>Filter Outstanding</button>
          <button onClick={() => { setSortAZ(false); setFilterOutstanding(false); }} style={{ padding: 8, borderRadius: 4 }}>Reset</button>
          <button onClick={() => navigate('/case/new')} style={{ background: COLORS.accent, color: COLORS.white, border: 'none', padding: '10px 16px', borderRadius: 6, cursor: 'pointer' }}>+ New Transaction</button>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: 40, background: COLORS.primary, color: COLORS.white }}>#</th>
              {"reference agent parties property".split(" ").map(key => (
                <th key={key} style={{ padding: '12px 8px', background: COLORS.primary, color: COLORS.white, borderBottom: `2px solid ${COLORS.border}`, textAlign: 'left' }}>{columns.find(c => c.key === key)?.label || key}</th>
              ))}
              <th style={{ padding: '12px 8px', background: COLORS.primary, color: COLORS.white }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c, i) => (
              <React.Fragment key={c._id}>
                <tr style={{ background: i % 2 === 0 ? COLORS.white : COLORS.gray }}>
                  <td style={{ padding: '6px 4px', backgroundColor: COLORS.primary, color: COLORS.white, fontWeight: 'bold', fontSize: '11px', textAlign: 'center', fontFamily: 'monospace', letterSpacing: '1px', borderRadius: 4 }}>{daysSince(c.instructionReceived)}</td>
                  {"reference agent parties property".split(" ").map(key => (
                    <td key={key} style={{ padding: '10px 8px', borderBottom: `1px solid ${COLORS.border}`, backgroundColor: c.colors?.[key] || 'inherit', wordBreak: 'break-word' }}>{c[key] || '—'}</td>
                  ))}
                  <td style={{ padding: '10px 8px', borderBottom: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => navigate(`/case/${c._id}`)} style={{ background: COLORS.primary, color: COLORS.white, border: 'none', padding: '6px 10px', borderRadius: 4 }}>Edit</button>
                      <button onClick={() => navigate(`/report/${c._id}`)} style={{ background: COLORS.accent, color: COLORS.primary, border: 'none', padding: '6px 10px', borderRadius: 4 }}>Report</button>
                      <button onClick={() => handleDelete(c._id)} style={{ background: '#e53e3e', color: COLORS.white, border: 'none', padding: '6px 10px', borderRadius: 4 }}>Delete</button>
                      <button onClick={() => setExpandedRow(expandedRow === c._id ? null : c._id)} style={{ background: COLORS.primary, color: COLORS.white, border: 'none', padding: '6px 10px', borderRadius: 4 }}>{expandedRow === c._id ? "Hide" : "View More"}</button>
                    </div>
                  </td>
                </tr>
                {expandedRow === c._id && (
                  <tr style={{ background: COLORS.gray }}>
                    <td colSpan={6} style={{ padding: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                        {renderSection("Information", columns.filter(col => ["reference", "instructionReceived", "parties", "agency", "agent", "purchasePrice", "property"].includes(col.key)), c)}
                        {renderSection("Financials", columns.filter(col => ["depositAmount", "depositDueDate", "depositFulfilledDate", "bondAmount", "bondDueDate", "bondFulfilledDate"].includes(col.key)), c)}
                        {renderSection("Transfer Process - Requested", columns.filter(col => col.key.includes("Requested") && !col.key.includes("instructionReceived")), c)}
                        {renderSection("Transfer Process - Received", columns.filter(col => col.key.includes("Received")), c)}
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
    </div>
  );
}
