require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(cors()); // Allow frontend to access API
app.use(express.json());

const PORT = process.env.PORT || 5000;

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (token !== process.env.API_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

app.get("/api/categories", authenticate, (req, res) => {
  res.json(["Apple", "Samsung", "Google"]);
});

app.get("/api/models/:category", authenticate, (req, res) => {
  res.json(["iPhone 12", "iPhone 13", "Galaxy S21"]);
});

app.get("/api/conditions", authenticate, (req, res) => {
  res.json(["New", "Used", "Broken"]);
});

app.get("/api/price/:model/:condition", authenticate, (req, res) => {
  res.json({ price: Math.floor(Math.random() * 500) + 100 });
});

app.use("/buyback-widget.js", express.static(__dirname + "/buyback-widget.js"));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
