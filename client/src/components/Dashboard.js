// File: src/components/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://case-tracking-frontend.onrender.com";
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

export default function Dashboard() {
  const [casesByUser, setCasesByUser] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(`${BASE_URL}/api/cases`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const grouped = res.data.reduce((acc, c) => {
          const user = c.createdBy?.username || "Unknown User";
          acc[user] = acc[user] || [];
          acc[user].push(c);
          return acc;
        }, {});
        setCasesByUser(grouped);
      })
      .catch(console.error);
  }, []);

  const renderSection = (title, fields, data) => (
    <>
      <div
        style={{
          gridColumn: "1 / -1",
          margin: "10px 0 4px",
          borderBottom: `2px solid ${COLORS.gold}`,
          paddingBottom: 4,
          fontWeight: "bold",
          fontSize: 14,
          color: COLORS.gold
        }}
      >
        {title}
      </div>
      {fields.map(({ key, label }) => (
        <div key={key}>
          <div
            style={{
              background: COLORS.primary,
              color: COLORS.white,
              padding: "6px 10px",
              borderRadius: 4,
              fontWeight: "bold"
            }}
          >
            {label}
          </div>
          <div
            style={{
              border: `1px solid ${COLORS.border}`,
              padding: "6px 10px",
              borderRadius: 4,
              backgroundColor: data.colors?.[key] || COLORS.white
            }}
          >
            {data[key] || "—"}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div style={{ background: COLORS.background, minHeight: "100vh", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <img src="/logo.png" alt="Logo" style={{ height: 90 }} />
        <h1 style={{ color: COLORS.primary, fontSize: 32 }}>Dashboard</h1>
      </div>
      {Object.entries(casesByUser).map(([user, cases]) => (
        <section key={user} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h2 style={{ color: COLORS.primary, backgroundColor: COLORS.accent, padding: "10px 20px", borderRadius: 6, fontSize: 20 }}>
              {user}
            </h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr>
                  {["reference", "agent", "parties", "property"].map((key) => (
                    <th
                      key={key}
                      style={{
                        padding: "12px 8px",
                        background: COLORS.primary,
                        color: COLORS.white,
                        borderBottom: `2px solid ${COLORS.border}`,
                        textAlign: "left"
                      }}
                    >
                      {columns.find((c) => c.key === key)?.label || key}
                    </th>
                  ))}
                  <th style={{ padding: "12px 8px", background: COLORS.primary, color: COLORS.white, borderBottom: `2px solid ${COLORS.border}` }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c, i) => (
                  <React.Fragment key={c._id}>
                    <tr
                      style={{
                        background: i % 2 === 0 ? COLORS.white : COLORS.gray,
                        borderBottom: `2px solid #4b5563`
                      }}
                    >
                      {["reference", "agent", "parties", "property"].map((key) => (
                        <td
                          key={key}
                          style={{
                            padding: "10px 8px",
                            backgroundColor: c.colors?.[key] || "inherit",
                            wordBreak: "break-word"
                          }}
                        >
                          {c[key] || "—"}
                        </td>
                      ))}
                      <td style={{ padding: "10px 8px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => navigate(`/case/${c._id}`)} style={{ background: COLORS.primary, color: COLORS.white, border: "none", padding: "6px 10px", borderRadius: 4 }}>
                            Edit
                          </button>
                          <button onClick={() => navigate(`/report/${c._id}`)} style={{ background: COLORS.accent, color: COLORS.primary, border: "none", padding: "6px 10px", borderRadius: 4 }}>
                            Report
                          </button>
                          <button onClick={() => setExpandedRow(expandedRow === c._id ? null : c._id)} style={{ background: COLORS.primary, color: COLORS.white, border: "none", padding: "6px 10px", borderRadius: 4 }}>
                            {expandedRow === c._id ? "Hide" : "View More"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === c._id && (
                      <tr style={{ background: COLORS.gray }}>
                        <td colSpan={5} style={{ padding: 16 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                            {renderSection("Information", columns.filter(col => ["reference", "instructionReceived", "parties", "agency", "agent", "purchasePrice", "property", "date"].includes(col.key)), c)}
                            {renderSection("Financials", columns.filter(col =>
                              col.key.includes("deposit") ||
                              (col.key.includes("bond") &&
                                !col.key.includes("bondCancellationFigures"))), c)}
                            {renderSection("Transfer Process - Requested", columns.filter(col => col.key.includes("Requested")), c)}
                            {renderSection("Transfer Process - Received", columns.filter(col =>
                              col.key.includes("Received") &&
                              col.key !== "instructionReceived"), c)}
                            {renderSection("Transfer Signed", columns.filter(col => col.key.includes("transferSigned")), c)}
                            {renderSection("Deeds Office", columns.filter(col =>
                              col.key.includes("documentsLodgedDate") ||
                              col.key.includes("deedsPrepDate") ||
                              col.key.includes("registrationDate")), c)}
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
    </div>
  );
}
