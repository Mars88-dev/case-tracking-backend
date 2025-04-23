import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const Cases = () => {
    const reportRef = useRef(null); // ✅ Correctly sets the ref

    const handlePrint = useReactToPrint({
        content: () => reportRef.current,
        documentTitle: "Case Report",
        onBeforePrint: () => console.log("🟢 Preparing PDF..."),
        onAfterPrint: () => console.log("✅ PDF Successfully Printed!"),
    });

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Cases</h1>

            {/* ✅ Content to be Printed */}
            <div ref={reportRef} style={{ padding: "20px", border: "2px solid black", background: "white" }}>
                <h2>Case Report</h2>
                <p>All case details will appear here.</p>
            </div>

            {/* ✅ Fixed Print Button */}
            <button onClick={handlePrint} style={{ marginTop: "20px", padding: "10px", background: "blue", color: "white" }}>
                Download Report as PDF
            </button>
        </div>
    );
};

export default Cases;
