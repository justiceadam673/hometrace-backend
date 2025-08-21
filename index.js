import express from "express";
import path from  "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import User from "./routes/user.route.js";
import connectDB from "./db/db.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 7000;
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));
app.use("/user", User);


app.get("/signup", (req, res) => {
  res.send("sign up successful")
});

app.get("/login", (req, res) => {
  res.send("signin successfully")
});

app.get("/verification", (req, res) => {
  res.send("verification complete")
});

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
