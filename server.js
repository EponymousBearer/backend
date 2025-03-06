// import dotenv from "dotenv";
// dotenv.config();
// // require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const app = express();

// app.use(express.json());
// app.use(cors()); // Allow all origins (for development)

// app.use(
//   cors({
//     origin: ["http://localhost:3000"], // Allow local and deployed frontend
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true, // Allow authentication headers
//   })
// );

// app.options("*", cors()); // Handle preflight requests

// const PORT = process.env.PORT || 5000;
// const API_KEY = process.env.API_KEY || "mySecretKey123"; // Ensure API key is set

// // Authentication Middleware
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

// // Categories Route
// app.get("/api/categories", authenticate, (req, res) => {
//   return res.json({ categories: ["Apple", "Samsung", "Google"] });
// });

// // Models Route
// app.get("/api/models/:category", authenticate, (req, res) => {
//   const models = {
//     Apple: ["iPhone 12", "iPhone 13"],
//     Samsung: ["Galaxy S21", "Galaxy S22"],
//     Google: ["Pixel 6", "Pixel 7"],
//   };
//   return res.json({ models: models[req.params.category] || [] });
// });

// // Conditions Route
// app.get("/api/conditions", authenticate, (req, res) => {
//   return res.json({ conditions: ["New", "Used", "Broken"] });
// });

// // Price Route
// app.get("/api/price/:model/:condition", authenticate, (req, res) => {
//   return res.json({ price: Math.floor(Math.random() * 500) + 100 });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
