// middleware/auth.js
import jwt from "jsonwebtoken";

const JWT_SECRET = "your-secret-key";

export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer TOKEN

  if (!token) return res.status(403).json({ error: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });

    req.user = decoded; // { id, role }
    next();
  });
};

// Only allow agents
export const isAgent = (req, res, next) => {
  if (req.user.role !== "agent") {
    return res.status(403).json({ error: "Only agents allowed" });
  }
  next();
};

// Only allow buyers
export const isBuyer = (req, res, next) => {
  if (req.user.role !== "buyer") {
    return res.status(403).json({ error: "Only buyers allowed" });
  }
  next();
};
