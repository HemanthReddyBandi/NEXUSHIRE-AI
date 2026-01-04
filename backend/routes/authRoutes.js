import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import Candidate from "../models/candidate.js";
import HR from "../models/HR.js";

const router = express.Router();

/* ---------- FILE UPLOAD (HR ID CARD) ---------- */
const storage = multer.diskStorage({
  destination: "uploads/hr_ids",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

const upload = multer({ storage });

/* ---------- CANDIDATE REGISTER ---------- */
router.post("/register/candidate", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await Candidate.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Candidate already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const candidate = await Candidate.create({
      email,
      password: hashedPassword
    });

    res.json({ message: "Candidate registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- HR REGISTER ---------- */
router.post(
  "/register/hr",
  upload.single("hrId"),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "HR ID card required" });
      }

      const existing = await HR.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "HR already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await HR.create({
        email,
        password: hashedPassword,
        hrIdDocument: req.file.path
      });

      res.json({ message: "HR registered successfully" });
    }catch (err) {
  console.error(err);
  res.status(500).json({
    message: err.message || "Server error"
  });
}

  }
);

/* ---------- LOGIN (COMMON) ---------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user =
      role === "hr"
        ? await HR.findOne({ email })
        : await Candidate.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
