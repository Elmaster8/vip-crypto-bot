import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import paymentsRoutes from "./routes/payments.js";
import { notifyExpiringUsers } from "./utils/notifyExpiry.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/payments", paymentsRoutes);

// Redirect root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Run daily reminder (Render free tier)
const intervalHours = process.env.CRON_INTERVAL_HOURS || 24;
setInterval(() => {
  notifyExpiringUsers();
}, intervalHours * 60 * 60 * 1000);
