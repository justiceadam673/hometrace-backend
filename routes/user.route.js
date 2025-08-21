import { Router } from "express";
import Users from "../models/user.js";
import { verifyToken, isAgent, isBuyer } from "../middleware/verifytoken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = Router();


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN 


// Signup route
router.post("/signup", async (req, res) => {
    console.log("Received data:", req.body);

  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await Users.findOne({ email: data.email });
    if (existingUser) {
      console.log(" User already exists:", existingUser);
      return res.status(400).send("User already exists. Please use a different email.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      name,
      email,
      password: hashedPassword,
      role: role || "buyer"
    };


    res.status(201).json({ message: "Signup successful!", user: newUser });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Error signing up.");
  }

});


// Login route
router.get("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: "Wrong password." });

    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );    

    res.json({
      message: "Login successful!",
      token,
      role: user.role
    });    

  } catch (err) {
    console.error(err);
    res.status(500).send("Login error.");
  }

});


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