import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors()); // Allow all origins (for development)

// app.use(
//   cors({
//     origin: ["http://localhost:3000"], // Allow local and deployed frontend
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true, // Allow authentication headers
//   })
// );

// app.use(
//   // cors({ origin: "https://rehash-project.vercel.app", credentials: true })
//   cors({ origin: "http://localhost:5173", credentials: true })
// );

// app.options("*", cors()); // Handle preflight requests

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY || "mySecretKey123"; // Ensure API key is set

// Authentication Middleware
// const authenticate = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
//   const token = authHeader.split(" ")[1];
//   if (token !== API_KEY) {
//     return res.status(403).json({ error: "Forbidden" });
//   }
//   next();
// };

// Categories Route
app.get("/api/categories", (req, res) => {
  return res.json({ categories: ["Apple", "Samsung", "Google"] });
});

// Models Route
app.get("/api/models/:category", (req, res) => {
  const models = {
    Apple: ["iPhone 12", "iPhone 13"],
    Samsung: ["Galaxy S21", "Galaxy S22"],
    Google: ["Pixel 6", "Pixel 7"],
  };
  return res.json({ models: models[req.params.category] || [] });
});

// Conditions Route
app.get("/api/conditions", (req, res) => {
  return res.json({ conditions: ["New", "Used", "Broken"] });
});

// Price Route
app.get("/api/price/:model/:condition", (req, res) => {
  return res.json({ price: Math.floor(Math.random() * 500) + 100 });
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Resolve __dirname (needed in ES module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "../public")));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
