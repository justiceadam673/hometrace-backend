import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) return res.status(403).json({ error: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });

    req.user = decoded; 
    next();
  });
};

export const isAgent = (req, res, next) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ error: "Only agents allowed" });
  }
  next();
};

export const isBuyer = (req, res, next) => {
  if (req.user.role !== "buyer") {
    return res.status(403).json({ error: "Only buyers allowed" });
  }
  next();
};

