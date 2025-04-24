// File: src/components/MyTransaction.js
// ✅ Updated to remove duplicate "Instruction Received" and "Bond Cancellation Figures"
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
    { key: `${item}Requested`, label: item.replace(/([A-Z])/g, " $1") + " - Requested" },
    { key: `${item}Received`, label: item.replace(/([A-Z])/g, " $1") + " - Received" }
  ]),
  { key: "transferSignedSellerDate", label: "Transfer Signed - Seller" },
  { key: "transferSignedPurchaserDate", label: "Transfer Signed - Purchaser" },
  { key: "documentsLodgedDate", label: "Docs Lodged" },
  { key: "deedsPrepDate", label: "Deeds Prep" },
  { key: "registrationDate", label: "Registration" },
  { key: "comments", label: "Comments" }
];

const renderSection = (title, fields, data) => (
  <>
    <div style={{
      gridColumn: "1 / -1",
      margin: "10px 0 4px",
      borderBottom: `2px solid ${COLORS.gold}`,
      paddingBottom: 4,
      fontWeight: "bold",
      fontSize: 14,
      color: COLORS.gold
    }}>{title}</div>
    {fields.map(({ key, label }) => (
      <div key={key}>
        <div style={{
          background: COLORS.primary,
          color: COLORS.white,
          padding: '6px 10px',
          borderRadius: 4,
          fontWeight: 'bold'
        }}>{label}</div>
        <div style={{
          border: `1px solid ${COLORS.border}`,
          padding: '6px 10px',
          borderRadius: 4,
          backgroundColor: data.colors?.[key] || COLORS.white
        }}>{data[key] || '—'}</div>
      </div>
    ))}
  </>
);

export default function MyTransaction() {
  const [cases, setCases] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios.get(`${BASE_URL}/api/mycases`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setCases(res.data))
      .catch(console.error);
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
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
        <button onClick={() => navigate('/case/new')} style={{ background: COLORS.accent, color: COLORS.white, border: 'none', padding: '10px 16px', borderRadius: 6, cursor: 'pointer' }}>+ New Transaction</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              {["reference", "agent", "parties", "property"].map(key => (
                <th key={key} style={{
                  padding: '12px 8px',
                  background: COLORS.primary,
                  color: COLORS.white,
                  borderBottom: `2px solid ${COLORS.border}`,
                  textAlign: 'left'
                }}>
                  {columns.find(c => c.key === key)?.label || key}
                </th>
              ))}
              <th style={{ padding: '12px 8px', background: COLORS.primary, color: COLORS.white, borderBottom: `2px solid ${COLORS.border}` }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c, i) => (
              <React.Fragment key={c._id}>
                <tr style={{ background: i % 2 === 0 ? COLORS.white : COLORS.gray }}>
                  {["reference", "agent", "parties", "property"].map(key => (
                    <td key={key} style={{ padding: '10px 8px', borderBottom: `1px solid ${COLORS.border}`, backgroundColor: c.colors?.[key] || 'inherit', wordBreak: 'break-word' }}>
                      {c[key] || '—'}
                    </td>
                  ))}
                  <td style={{ padding: '10px 8px', borderBottom: `1px solid ${COLORS.border}` }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => navigate(`/case/${c._id}`)} style={{ background: COLORS.primary, color: COLORS.white, border: 'none', padding: '6px 10px', borderRadius: 4 }}>Edit</button>
                      <button onClick={() => navigate(`/report/${c._id}`)} style={{ background: COLORS.accent, color: COLORS.primary, border: 'none', padding: '6px 10px', borderRadius: 4 }}>Report</button>
                      <button onClick={() => handleDelete(c._id)} style={{ background: '#e53e3e', color: COLORS.white, border: 'none', padding: '6px 10px', borderRadius: 4 }}>Delete</button>
                      <button onClick={() => setExpandedRow(expandedRow === c._id ? null : c._id)} style={{ background: COLORS.primary, color: COLORS.white, border: 'none', padding: '6px 10px', borderRadius: 4 }}>
                        {expandedRow === c._id ? "Hide" : "View More"}
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRow === c._id && (
                  <tr style={{ background: COLORS.gray }}>
                    <td colSpan={5} style={{ padding: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                        {renderSection("Information", columns.filter(col => ["reference", "parties", "agency", "agent", "purchasePrice", "property"].includes(col.key)), c)}
                        {renderSection("Financials", columns.filter(col => col.key.includes("deposit") || (col.key.includes("bond") && !col.key.includes("bondCancellationFigures"))), c)}
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
