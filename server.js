import express from "express";
import dotenv from "dotenv";
import paymentsRouter from "./routes/payments.js";
import discordRouter from "./routes/discord.js";

dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use("/payments", paymentsRouter);
app.use("/discord", discordRouter);

app.get("/", (req, res) => {
  res.json({ message: "VIP Crypto Bot is live 🚀" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
