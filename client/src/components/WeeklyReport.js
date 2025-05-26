// File: src/components/WeeklyReport.js
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";

const COLORS = {
  navy: "#142a4f",
  gold: "#d2ac68",
  beige: "#f9f4ed",
  border: "#e5e7eb",
  white: "#ffffff"
};

const BOX_STYLE = {
  border: "1px solid #c8b68b",
  backgroundColor: COLORS.beige,
  padding: "6px",
  fontSize: 11
};

const BUTTON_STYLE = {
  padding: "8px 16px",
  margin: "10px 8px 0",
  backgroundColor: COLORS.navy,
  color: COLORS.white,
  border: "none",
  borderRadius: 4,
  cursor: "pointer"
};

export default function WeeklyReport() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const reportRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`https://case-tracking-backend.onrender.com/api/cases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setCaseData(res.data))
      .catch(console.error);
  }, [id]);

  const handleDownloadJPG = () => {
    if (!reportRef.current) return;
    html2canvas(reportRef.current, {
      backgroundColor: COLORS.white,
      scale: 2,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      windowHeight: 1123
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `Weekly_Report_${caseData.reference}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
    });
  };

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: caseData ? `${caseData.reference} - Weekly Report` : "Weekly Report",
    pageStyle: `
      @media print {
        @page {
          size: A4 portrait;
          margin: 0;
        }
        body {
          margin: 0;
          -webkit-print-color-adjust: exact;
        }
        #report-container {
          width: 794px;
          height: 1123px;
          overflow: hidden;
        }
      }
    `
  });

  if (!caseData) return <div>Loading...</div>;
  const today = new Date().toLocaleDateString("en-GB");

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return isNaN(date) ? value : date.toLocaleDateString("en-GB");
  };

  const Field = ({ label, value }) => (
    <div style={{ display: "flex", flexDirection: "column", fontSize: 11 }}>
      <label style={{ marginBottom: 2, fontWeight: "bold" }}>{label}</label>
      <div style={{ border: "1px solid #c8b68b", minHeight: 20, backgroundColor: COLORS.beige, padding: "2px 4px" }}>{formatDate(value)}</div>
    </div>
  );

  const DualField = ({ label, requestedKey, receivedKey }) => (
    <div style={{ fontSize: 11, border: "1px solid #c8b68b", backgroundColor: COLORS.beige, padding: 4 }}>
      <div style={{ fontWeight: "bold", marginBottom: 2, backgroundColor: COLORS.navy, color: COLORS.white, padding: "4px 6px", borderRadius: 4 }}>{label}</div>
      <div><strong>Requested:</strong> {formatDate(caseData[requestedKey])}</div>
      <div><strong>Received:</strong> {formatDate(caseData[receivedKey])}</div>
    </div>
  );

  return (
    <div style={{ background: COLORS.beige, padding: 10, fontFamily: "Arial, sans-serif", minHeight: "100vh" }}>
      <div id="report-container" ref={reportRef} style={{ width: 794, height: 1123, margin: "auto", backgroundColor: COLORS.white, padding: 18, boxSizing: "border-box", fontFamily: "Arial, sans-serif", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <header style={{ marginBottom: 10 }}>
            <img src="/header.png" alt="Header" style={{ width: "100%" }} />
          </header>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
            <div style={{ fontWeight: "bold", color: COLORS.navy }}>
              Our Transfer: {caseData.property || ""}
            </div>
            <div><strong>Date:</strong> {today}</div>
          </div>

          <Section title="INFORMATION">
            <Grid cols={2}>
              <Field label="Instruction received" value={caseData.instructionReceived} />
              <Field label="Parties" value={caseData.parties} />
              <Field label="Agency" value={caseData.agency} />
              <Field label="Purchase Price" value={caseData.purchasePrice} />
              <Field label="Agent" value={caseData.agent} />
              <Field label="Property" value={caseData.property} />
            </Grid>
          </Section>

          <Section title="FINANCIALS">
            <Grid cols={4}>
              <Field label="Deposit Amount" value={caseData.depositAmount} />
              <Field label="Deposit Due" value={caseData.depositDueDate} />
              <Field label="Deposit Fulfilled" value={caseData.depositFulfilledDate} />
              <Field label="Notes" value="" />
              <Field label="Bond Amount" value={caseData.bondAmount} />
              <Field label="Bond Due" value={caseData.bondDueDate} />
              <Field label="Bond Fulfilled" value={caseData.bondFulfilledDate} />
              <Field label="Notes" value="" />
            </Grid>
          </Section>

          <Section title="TRANSFER PROCESS">
            <Grid cols={3}>
              <DualField label="Seller FICA Documents" requestedKey="sellerFicaDocumentsRequested" receivedKey="sellerFicaDocumentsReceived" />
              <DualField label="Purchaser FICA Documents" requestedKey="purchaserFicaDocumentsRequested" receivedKey="purchaserFicaDocumentsReceived" />
              <DualField label="Title Deed" requestedKey="titleDeedRequested" receivedKey="titleDeedReceived" />
              <DualField label="Bond Cancellation Figures" requestedKey="bondCancellationFiguresRequested" receivedKey="bondCancellationFiguresReceived" />
              <DualField label="Municipal Clearance Figures" requestedKey="municipalClearanceFiguresRequested" receivedKey="municipalClearanceFiguresReceived" />
              <DualField label="Transfer Duty Receipt" requestedKey="transferDutyReceiptRequested" receivedKey="transferDutyReceiptReceived" />
              <DualField label="Guarantees from Bond Attorneys" requestedKey="guaranteesFromBondAttorneysRequested" receivedKey="guaranteesFromBondAttorneysReceived" />
              <DualField label="Transfer Cost" requestedKey="transferCostRequested" receivedKey="transferCostReceived" />
              <DualField label="COC Electrical Compliance Certificate" requestedKey="electricalComplianceCertificateRequested" receivedKey="electricalComplianceCertificateReceived" />
              <DualField label="Municipal Clearance Certificate" requestedKey="municipalClearanceCertificateRequested" receivedKey="municipalClearanceCertificateReceived" />
              <DualField label="Levy Clearance Certificate" requestedKey="levyClearanceCertificateRequested" receivedKey="levyClearanceCertificateReceived" />
              <DualField label="HOA Certificate" requestedKey="hoaCertificateRequested" receivedKey="hoaCertificateReceived" />
            </Grid>
          </Section>

          <Section title="TRANSFER DOCUMENTS SIGNED">
            <Grid cols={2}>
              <Field label="Seller" value={caseData.transferSignedSellerDate} />
              <Field label="Purchaser" value={caseData.transferSignedPurchaserDate} />
            </Grid>
          </Section>

          <Section title="DEEDS OFFICE PROCESS">
            <Grid cols={3}>
              <Field label="Documents Lodged" value={caseData.documentsLodgedDate} />
              <Field label="Deeds Preparation" value={caseData.deedsPrepDate} />
              <Field label="Registration" value={caseData.registrationDate} />
            </Grid>
          </Section>

          <Section title="COMMENTS">
            <div style={{ ...BOX_STYLE, minHeight: 50 }}>{caseData.comments || "—"}</div>
          </Section>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button onClick={handleDownloadJPG} style={BUTTON_STYLE}>Download Report as JPG</button>
        <button onClick={handlePrint} style={BUTTON_STYLE}>Print Report</button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 10 }}>
      <h2 style={{ backgroundColor: COLORS.navy, color: "#fff", padding: "6px 10px", borderRadius: 4, fontSize: 13 }}>{title}</h2>
      <div style={{ marginTop: 8 }}>{children}</div>
    </section>
  );
}

function Grid({ cols = 2, children }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6 }}>{children}</div>;
}
