import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import routes from "../routes/routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors()); // Allow all origins (for development)

const PORT = process.env.PORT || 5001;
const API_KEY = process.env.API_KEY || "mySecretKey123"; // Ensure API key is set

// Categories Route
app.get("/api/categories", (req, res) => {
  return res.json({ categories: ["Apple", "Samsung", "Google"] });
});

app.use("/api", routes); // Registering the new route

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
// app.get("/api/conditions", (req, res) => {
//   return res.json({ conditions: ["New", "Used", "Broken"] });
// });

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
