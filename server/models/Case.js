// File: server/models/Case.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});

const caseSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reference: String,
  date: String,
  instructionReceived: { type: Date },
  parties: String,
  agency: String,
  purchasePrice: String,
  agent: String,
  property: String,
  depositAmount: String,
  depositDueDate: String,
  depositFulfilledDate: String,
  bondAmount: String,
  bondDueDate: String,
  bondFulfilledDate: String,

  // Transfer Process Items (each with requested & received)
  sellerFicaDocumentsRequested: String,
  sellerFicaDocumentsReceived: String,
  purchaserFicaDocumentsRequested: String,
  purchaserFicaDocumentsReceived: String,
  titleDeedRequested: String,
  titleDeedReceived: String,
  bondCancellationFiguresRequested: String,
  bondCancellationFiguresReceived: String,
  municipalClearanceFiguresRequested: String,
  municipalClearanceFiguresReceived: String,
  transferDutyReceiptRequested: String,
  transferDutyReceiptReceived: String,
  guaranteesFromBondAttorneysRequested: String,
  guaranteesFromBondAttorneysReceived: String,
  transferCostRequested: String,
  transferCostReceived: String,
  electricalComplianceCertificateRequested: String,
  electricalComplianceCertificateReceived: String,
  municipalClearanceCertificateRequested: String,
  municipalClearanceCertificateReceived: String,
  levyClearanceCertificateRequested: String,
  levyClearanceCertificateReceived: String,
  hoaCertificateRequested: String,
  hoaCertificateReceived: String,

  transferSignedSellerDate: String,
  transferSignedPurchaserDate: String,
  documentsLodgedDate: String,
  deedsPrepDate: String,
  registrationDate: String,
  comments: String,

  isActive: { type: Boolean, default: true }, // ✅ NEW FIELD ADDED

  colors: { type: mongoose.Schema.Types.Mixed, default: {} },
  messages: [messageSchema]
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);
