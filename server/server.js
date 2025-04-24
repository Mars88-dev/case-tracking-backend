const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());

// ✅ CORS configuration for localhost dev + deployed frontend
app.use(cors({
  oorigin: ["http://localhost:3000", "https://case-tracking-frontend.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ MongoDB Connection
mongoose.connect("mongodb+srv://superadmin:superadmin@lawfirmcluster.euw1z.mongodb.net/?retryWrites=true&w=majority&appName=LawFirmCluster")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Models
const User = require("./models/User");
const Case = require("./models/Case");

// Middleware for JWT Auth
const authMiddleware = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1] || req.query.token;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, "my_super_secret_key");
    req.userId = decoded.userId;
    req.user = await User.findById(decoded.userId);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Auth: Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: "All fields are required" });

    if (await User.findOne({ email })) return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, await bcrypt.genSalt(10));
    await new User({ username, email, password: hash, isAdmin }).save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Auth: Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, "my_super_secret_key", { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// CRUD Routes

// Create Case
app.post("/api/cases", authMiddleware, async (req, res) => {
  try {
    const newCase = new Case({ ...req.body, createdBy: req.userId });
    const saved = await newCase.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Cases (with createdBy.username)
app.get("/api/cases", authMiddleware, async (req, res) => {
  try {
    const all = await Case.find().populate("createdBy", "username");
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get My Cases
app.get("/api/mycases", authMiddleware, async (req, res) => {
  try {
    const mine = await Case.find({ createdBy: req.userId });
    res.json(mine);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get One Case
app.get("/api/cases/:id", authMiddleware, async (req, res) => {
  try {
    const found = await Case.findById(req.params.id);
    if (!found) return res.status(404).json({ message: "Not found" });
    res.json(found);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Case
app.put("/api/cases/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Case.findById(req.params.id);
    if (!updated) return res.status(404).json({ message: "Not found" });

    const canEdit = req.user.isAdmin || updated.createdBy.toString() === req.userId;
    if (!canEdit) return res.status(403).json({ message: "Unauthorized" });

    Object.assign(updated, req.body);
    await updated.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Case
app.delete("/api/cases/:id", authMiddleware, async (req, res) => {
  try {
    const c = await Case.findById(req.params.id);
    const canDelete = req.user.isAdmin || c?.createdBy.toString() === req.userId;
    if (!canDelete) return res.status(403).json({ message: "Unauthorized" });

    await c.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Report Generator (docx — optional legacy support)
app.get("/api/report/:id", authMiddleware, async (req, res) => {
  try {
    const data = await Case.findById(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    const tplPath = path.resolve(__dirname, "templates", "Weekly GBA Report.docx");
    if (!fs.existsSync(tplPath)) return res.status(500).json({ message: "Template missing" });

    const content = fs.readFileSync(tplPath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.setData(data);
    doc.render();
    const buf = doc.getZip().generate({ type: "nodebuffer" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", "attachment; filename=Weekly_GBA_Report.docx");
    res.send(buf);
  } catch (err) {
    res.status(500).json({ message: "Report error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
