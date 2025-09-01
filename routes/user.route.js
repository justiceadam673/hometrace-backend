import { Router } from "express";
import User from "../models/user.js";
import { verifyToken, isAgent, isBuyer } from "../middleware/verifytoken.js";
import { upload } from "../middleware/upload.js";
import { sendOtpEmail } from "../utility/mailer.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = Router();


const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
    });

    await newUser.save();

    await sendOtpEmail(email, otp);

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: "Signup successful. Please verify your account with the OTP sent to your email.",
      token,
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Signup error", details: err.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    if (!user.isVerified) {
      return res.status(403).json({ error: "User not verified. Please complete verification." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login error", details: err.message });
  }
});


// verification route
router.post(
  "/verify",
  verifyToken,
  (req, res, next) => {
    upload.single("document")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  async (req, res) => {
    try {
      const { nationalId, phone, otp } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) return res.status(400).json({ error: "User not found" });

      if (user.isVerified) {
        return res.status(400).json({ error: "User already verified" });
      }

      if (user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      user.isVerified = true;
      user.otp = null;
      user.otpExpires = null;
      user.phone = phone || user.phone;
      user.nationalId = nationalId || user.nationalId;

    if (user.role === "agent") {
      if (!req.file) {
        return res.status(400).json({ error: "Document upload required for agents" });
      }
      user.nationalId = nationalId;
      user.phone = phone;
      user.document = req.file.path;
    } else if (user.role === "buyer") {
      user.phone = phone;
    }

      await user.save();

      return res.json({ message: "Verification successful" });
    } catch (err) {
      console.error("Verification error:", err);
      return res.status(500).json({ error: "Verification failed" });
    }
  }
);


// Protected route (only logged-in users)
router.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Your profile", user: req.user });
});

// Agent-only route
router.post("/property", verifyToken, isAgent, (req, res) => {
  res.json({ message: "Property created by agent", agentId: req.user.id });
});

// Buyer-only route
router.get("/browse", verifyToken, isBuyer, (req, res) => {
  res.json({ message: "Buyer browsing properties" });
});


export default router;