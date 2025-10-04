import express from "express";
import axios from "axios";
import CryptoJS from "crypto-js";

const router = express.Router();

const endpoint = `https://api.maxelpay.com/v1/${process.env.MAXELPAY_ENV}/merchant/order/checkout`;

const encryptPayload = (secretKey, payload) => {
  const key = CryptoJS.enc.Utf8.parse(secretKey);
  const iv = CryptoJS.enc.Utf8.parse(secretKey.substr(0,16));
  return CryptoJS.AES.encrypt(JSON.stringify(payload), key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString();
};

router.post("/create", async (req, res) => {
  try {
    const { orderID, amount, userEmail } = req.body;
    const payload = {
      orderID,
      amount,
      currency: "USD",
      timestamp: Math.floor(Date.now()/1000).toString(),
      userName: "VIP Member",
      siteName: "VIP Crypto Bot",
      userEmail,
      redirectUrl: `${process.env.FRONTEND_URL}/thank-you`,
      websiteUrl: process.env.FRONTEND_URL,
      cancelUrl: `${process.env.FRONTEND_URL}/cancel`,
      webhookUrl: `${process.env.BASE_URL}/payments/webhook`
    };
    const encrypted = encryptPayload(process.env.MAXELPAY_SECRET_KEY, payload);
    const { data } = await axios.post(endpoint, { data: encrypted }, { headers: { "api-key": process.env.MAXELPAY_API_KEY } });
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to create checkout" });
  }
});

export default router;
