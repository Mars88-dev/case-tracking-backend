// File: src/components/CaseDetail.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://case-tracking-backend.onrender.com";
const COLORS = {
  primary: "#142a4f",
  accent: "#d2ac68",
  background: "#f5f5f5",
  white: "#ffffff",
  grayLight: "#e5e7eb"
};
const DATE_OPTIONS = ["N/A", "Partly", "Requested"];

const initialForm = {
  instructionReceived: "",
  parties: "",
  agency: "",
  purchasePrice: "",
  agent: "",
  property: "",
  reference: "",
  depositAmount: "",
  depositDueDate: "",
  depositFulfilledDate: "",
  bondAmount: "",
  bondDueDate: "",
  bondFulfilledDate: "",
  comments: "",
  transferSignedSellerDate: "",
  transferSignedPurchaserDate: "",
  documentsLodgedDate: "",
  deedsPrepDate: "",
  registrationDate: "",
  colors: {},
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

TRANSFER_ITEMS.forEach(item => {
  initialForm[`${item}Requested`] = "";
  initialForm[`${item}Received`] = "";
});

const ColorInput = ({ name, value, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
    <input
      type="color"
      name={`colors.${name}`}
      value={value || "#ffffff"}
      onChange={e => onChange({ target: { name: `colors.${name}`, value: e.target.value } })}
      style={{ border: "none", background: "transparent" }}
    />
    <button
      type="button"
      onClick={() => onChange({ target: { name: `colors.${name}`, value: "" } })}
      style={{ fontSize: 12, background: "none", border: "1px solid #ccc", borderRadius: 4, padding: "2px 6px", cursor: "pointer" }}
    >
      Reset
    </button>
  </div>
);

const Input = ({ label, name, value, onChange, color }) => (
  <div style={{ ...styles.field, backgroundColor: color }}>
    <label style={styles.label}>{label}</label>
    <input type="text" name={name} value={value || ""} onChange={onChange} style={styles.input} />
    <ColorInput name={name} value={color} onChange={onChange} />
  </div>
);

const DateSelect = ({ label, name, value, onChange, color }) => {
  const isDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
  return (
    <div style={{ ...styles.field, backgroundColor: color }}>
      <label style={styles.label}>{label}</label>
      <div style={styles.dateRow}>
        <input type="date" name={name} value={isDate ? value : ""} onChange={onChange} style={styles.input} />
        <select name={name} value={!isDate ? value || "" : ""} onChange={onChange} style={styles.select}>
          <option value="" hidden>--</option>
          {DATE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <ColorInput name={name} value={color} onChange={onChange} />
    </div>
  );
};

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      const token = localStorage.getItem("token");
      axios.get(`${BASE_URL}/api/cases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => { setForm(res.data); setLoading(false); })
        .catch(console.error);
    }
  }, [id, isNew]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith("colors.")) {
      const fieldName = name.split(".")[1];
      setForm(prev => ({ ...prev, colors: { ...prev.colors, [fieldName]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const url = isNew ? `${BASE_URL}/api/cases` : `${BASE_URL}/api/cases/${id}`;
    try {
      const token = localStorage.getItem("token");
      const cfg = { headers: { Authorization: `Bearer ${token}` } };
      const dataToSave = { ...form };
      if (isNew) {
        dataToSave.date = new Date().toISOString().slice(0, 10);
      }
      const response = await axios({ method: isNew ? "post" : "put", url, data: dataToSave, ...cfg });
      console.log("✅ Save response:", response.data);
      navigate("/mytransactions");
    } catch (err) {
      console.error("❌ Save error:", err.response || err);
      alert(err.response?.data?.message || "Error saving transaction");
    }
  };

  if (loading) return <div style={styles.loading}>Loading…</div>;

  const sections = [
    {
      title: "Information",
      icon: "📝",
      cols: 3,
      fields: [
        { label: "Reference", name: "reference" },
        { label: "Instruction Received", name: "instructionReceived" },
        { label: "Parties", name: "parties" },
        { label: "Agency", name: "agency" },
        { label: "Purchase Price", name: "purchasePrice" },
        { label: "Agent", name: "agent" },
        { label: "Property", name: "property" }
      ]
    },
    {
      title: "Financials",
      icon: "💰",
      cols: 3,
      fields: [
        { type: "text", label: "Deposit Amount", name: "depositAmount" },
        { type: "date", label: "Deposit Due", name: "depositDueDate" },
        { type: "date", label: "Deposit Fulfilled", name: "depositFulfilledDate" },
        { type: "text", label: "Bond Amount", name: "bondAmount" },
        { type: "date", label: "Bond Due", name: "bondDueDate" },
        { type: "date", label: "Bond Fulfilled", name: "bondFulfilledDate" }
      ]
    },
    {
      title: "Transfer Process",
      icon: "🔄",
      cols: 2,
      fields: TRANSFER_ITEMS.flatMap(item => ([
        { type: "date", label: `${item.replace(/([A-Z])/g, ' $1')} - Requested`, name: `${item}Requested` },
        { type: "date", label: `${item.replace(/([A-Z])/g, ' $1')} - Received`, name: `${item}Received` }
      ]))
    },
    {
      title: "Transfer Documents Signed",
      icon: "✍️",
      cols: 2,
      fields: [
        { type: "date", label: "Seller Signed", name: "transferSignedSellerDate" },
        { type: "date", label: "Purchaser Signed", name: "transferSignedPurchaserDate" }
      ]
    },
    {
      title: "Deeds Office Process",
      icon: "🏛️",
      cols: 3,
      fields: [
        { type: "date", label: "Docs Lodged", name: "documentsLodgedDate" },
        { type: "date", label: "Deeds Prep", name: "deedsPrepDate" },
        { type: "date", label: "Registration", name: "registrationDate" }
      ]
    },
    {
      title: "Comments",
      icon: "✏️",
      cols: 1,
      fields: [
        { type: "textarea", label: "Comments", name: "comments" }
      ]
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
        <h1 style={styles.title}>{isNew ? "New" : "Edit"} Transaction</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          {sections.map(sec => (
            <div key={sec.title} style={{ ...styles.section, backgroundColor: COLORS.accent }}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionIcon}>{sec.icon}</span>
                <h2 style={styles.sectionTitle}>{sec.title}</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${sec.cols}, 1fr)`, gap: 16, marginTop: 12 }}>
                {sec.fields.map(field => (
                  field.type === 'date'
                    ? <DateSelect key={field.name} {...field} value={form[field.name]} color={form.colors?.[field.name]} onChange={handleChange} />
                    : <Input key={field.name} {...field} value={form[field.name]} color={form.colors?.[field.name]} onChange={handleChange} />
                ))}
              </div>
            </div>
          ))}
          <button type="submit" style={styles.saveBtn}>Save Transaction</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: COLORS.background, padding: 20, minHeight: '100vh' },
  card: { backgroundColor: COLORS.white, borderRadius: 8, padding: 24, maxWidth: 1000, margin: 'auto', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' },
  backBtn: { background: COLORS.primary, color: COLORS.white, border: 'none', padding: '8px 14px', borderRadius: 4, cursor: 'pointer', marginBottom: 16 },
  title: { color: COLORS.primary, fontSize: 28, margin: '8px 0 24px' },
  form: { display: 'flex', flexDirection: 'column' },
  section: { padding: 16, borderRadius: 6, marginBottom: 24 },
  sectionHeader: { display: 'flex', alignItems: 'center', backgroundColor: COLORS.primary, padding: '6px 12px', borderRadius: 4 },
  sectionIcon: { marginRight: 8, fontSize: 18 },
  sectionTitle: { color: COLORS.white, fontSize: 18, fontWeight: 600 },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: 14, color: COLORS.primary, marginBottom: 6 },
  input: { padding: 10, border: `1px solid ${COLORS.grayLight}`, borderRadius: 4, flex: 1 },
  select: { padding: 10, border: `1px solid ${COLORS.grayLight}`, borderRadius: 4, width: 120 },
  dateRow: { display: 'flex', gap: 12 },
  saveBtn: { alignSelf: 'flex-end', padding: '12px 24px', background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.primary})`, color: COLORS.white, border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
  loading: { textAlign: 'center', padding: 40, fontSize: 18 }
};
