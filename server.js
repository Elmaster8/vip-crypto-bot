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

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Safe daily reminder (won’t crash server)
const intervalHours = parseInt(process.env.CRON_INTERVAL_HOURS) || 24;
setInterval(async () => {
  try {
    await notifyExpiringUsers();
    console.log("Checked for expiring VIP users");
  } catch (err) {
    console.error("Error in notifyExpiringUsers:", err);
  }
}, intervalHours * 60 * 60 * 1000);
