const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const app = express();
app.use(cors()); // Allow frontend to access API
app.use(express.json());

// Dummy Data for Trade-in
const categories = ["Apple", "Samsung", "Google"];
const models = {
  Apple: ["iPhone 12", "iPhone 13", "iPhone 14"],
  Samsung: ["Galaxy S21", "Galaxy S22"],
  Google: ["Pixel 6", "Pixel 7"],
};
const conditions = ["New", "Good", "Fair", "Broken"];
const prices = {
  "iPhone 12": { New: 500, Good: 400, Fair: 300, Broken: 100 },
  "iPhone 13": { New: 600, Good: 500, Fair: 350, Broken: 150 },
};

// API Routes
app.get("/api/categories", (req, res) => res.json(categories));
app.get("/api/models/:category", (req, res) =>
  res.json(models[req.params.category] || [])
);
app.get("/api/conditions", (req, res) => res.json(conditions));
app.get("/api/price/:model/:condition", (req, res) => {
  const { model, condition } = req.params;
  res.json({ price: prices[model]?.[condition] || "Not Available" });
});

// Host Widget JavaScript
// app.get("/buyback-widget.js", (req, res) => {
//   res.sendFile(__dirname + "/buyback-widget.js");
// });

app.use(express.static("public"));

app.get("/buyback-widget.js", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "buyback-widget.js"));
});

// Start Server
app.listen(5000, () => console.log("Server running on port 5000"));

// Serve the buyback-widget.js file
