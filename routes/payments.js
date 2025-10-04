import express from "express";
import fetch from "node-fetch";
import { assignVipRole, createUniqueInvite } from "../utils/discord.js";
import { sendInviteEmail } from "../utils/email.js";
import sqlite3 from "sqlite3";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// SQLite DB
const db = new sqlite3.Database("./db/vip_users.db", (err) => {
  if (err) console.error(err);
  else console.log("SQLite DB connected");
});

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  discord_id TEXT,
  invite TEXT,
  expires_at INTEGER
)`);

// Create MaxelPay checkout
router.post("/create", async (req, res) => {
  const { orderID, amount, userEmail } = req.body;

  const payload = {
    orderID,
    amount,
    currency: "USD",
    timestamp: Math.floor(Date.now() / 1000),
    userName: userEmail.split("@")[0],
    siteName: "VIP Crypto",
    userEmail,
    redirectUrl: `${process.env.FRONTEND_URL}/thank-you.html`,
    cancelUrl: `${process.env.FRONTEND_URL}/cancel.html`,
    webhookUrl: `${process.env.BASE_URL}/payments/webhook`
  };

  const key = CryptoJS.enc.Utf8.parse(process.env.MAXELPAY_SECRET_KEY);
  const iv = CryptoJS.enc.Utf8.parse(process.env.MAXELPAY_SECRET_KEY.substr(0,16));
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key, {
    iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7
  }).toString();

  try {
    const response = await fetch(`https://api.maxelpay.com/v1/prod/merchant/order/checkout`, {
      method: "POST",
      headers: { "api-key": process.env.MAXELPAY_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ data: encrypted })
    });
    const data = await response.json();
    if(data.checkout_url) res.json({ checkout_url: data.checkout_url });
    else res.status(500).json({ error: "Failed to create checkout" });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Error creating checkout" });
  }
});

// Webhook for successful payment
router.post("/webhook", async (req, res) => {
  const { userEmail, discordId } = req.body;

  try {
    const invite = await createUniqueInvite();
    await assignVipRole(discordId);
    const expiresAt = Date.now() + 30*24*60*60*1000; // 30 days

    db.run(`INSERT INTO users (email, discord_id, invite, expires_at) VALUES (?,?,?,?)`,
      [userEmail, discordId, invite, expiresAt], (err) => {
        if(err) console.error(err);
      });

    await sendInviteEmail(userEmail, invite);
    res.status(200).json({ success: true });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Webhook failed" });
  }
});

export default router;
