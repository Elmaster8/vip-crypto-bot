import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import CryptoJS from "crypto-js";
import axios from "axios";

dotenv.config();
const app = express();
app.use(express.json());

// ✅ MaxelPay Configuration
const environment = process.env.MAXELPAY_ENV || "stg";
const apiKey = process.env.MAXELPAY_API_KEY;
const secretKey = process.env.MAXELPAY_SECRET_KEY;
const endpoint = `https://api.maxelpay.com/v1/${environment}/merchant/order/checkout`;

// ✅ Encryption
const encryptPayload = (secretKey, payload) => {
  const key = CryptoJS.enc.Utf8.parse(secretKey);
  const iv = CryptoJS.enc.Utf8.parse(secretKey.substr(0, 16));
  const encrypted = CryptoJS.AES.encrypt(payload, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
};

// ✅ Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// ✅ Main route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to VIP Crypto Bot API 🚀",
    patreon: process.env.PATREON_URL,
    telegram: process.env.TELEGRAM_BOT_URL
  });
});

// ✅ Checkout route
app.post("/create-checkout", async (req, res) => {
  try {
    const { orderID, amount, userEmail } = req.body;
    const payload = {
      orderID,
      amount,
      currency: "USD",
      timestamp: Math.floor(Date.now() / 1000).toString(),
      userName: "VIP Member",
      siteName: "VIP Crypto Bot",
      userEmail,
      redirectUrl: "https://yourdomain.com/thank-you",
      websiteUrl: "https://yourdomain.com",
      cancelUrl: "https://yourdomain.com/cancel",
      webhookUrl: "https://yourdomain.com/webhook"
    };

    const encrypt_payload = encryptPayload(secretKey, JSON.stringify(payload));
    const body = { data: encrypt_payload };

    const response = await axios.post(endpoint, body, {
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json"
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error creating checkout:", error.message);
    res.status(500).json({ error: "Failed to create checkout" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
