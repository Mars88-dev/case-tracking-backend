const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Message = require("./models/Message");
const Docxtemplater = require("docxtemplater");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(express.json());

// ✅ CORS configuration for localhost dev + deployed frontend
app.use(cors({
  origin: [
    "http://localhost:3000",
    process.env.FRONTEND_ORIGIN || "https://case-tracking-frontend.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Handle preflight requests (OPTIONS)
app.options('*', cors({
  origin: [
    "http://localhost:3000",
    process.env.FRONTEND_ORIGIN || "https://case-tracking-frontend.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Models
const User = require("./models/User");
const Case = require("./models/Case");

// Helper: parse dd/mm/yyyy to real Date
function parseDMY(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return undefined;
  const [day, month, year] = dateStr.split("/");
  if (!day || !month || !year) return undefined;
  const parsed = new Date(`${year}-${month}-${day}`);
  return isNaN(parsed) ? undefined : parsed;
}

// Middleware for JWT Auth
const authMiddleware = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1] || req.query.token;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get current logged-in user
app.get("/api/users/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("username email isAdmin");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error in /api/users/me:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CRUD Routes

// Create Case
app.post("/api/cases", authMiddleware, async (req, res) => {
  try {
    const data = {
      ...req.body,
      createdBy: req.userId,
      instructionReceived: parseDMY(req.body.instructionReceived),
      isActive: req.body.isActive ?? true
    };    
    const newCase = new Case(data);
    const saved = await newCase.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
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

    Object.assign(updated, {
      ...req.body,
      instructionReceived: req.body.instructionReceived
        ? parseDMY(req.body.instructionReceived)
        : updated.instructionReceived,
      isActive: req.body.isActive !== undefined ? req.body.isActive : updated.isActive
    });    

    await updated.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all messages for a case
app.get("/api/cases/:id/messages", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ caseId: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Message fetch error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Post a new message
app.post("/api/cases/:id/messages", authMiddleware, async (req, res) => {
  try {
    const message = new Message({
      caseId: req.params.id,
      userId: req.userId,
      username: req.user.username,
      content: req.body.content
    });
    const saved = await message.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Failed to post message:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a message
app.delete("/api/cases/:caseId/messages/:messageId", authMiddleware, async (req, res) => {
  try {
    const { caseId, messageId } = req.params;
    const message = await Message.findOne({ _id: messageId, caseId });

    if (!message) return res.status(404).json({ message: "Message not found" });

    // Only the sender or an admin can delete the message
    const user = await User.findById(req.userId);
    if (!user) return res.status(403).json({ message: "Unauthorized" });

    if (!user.isAdmin && message.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not allowed to delete this message" });
    }

    await message.deleteOne();
    res.json({ message: "Message deleted" });
  } catch (err) {
    console.error("Error deleting message:", err);
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
