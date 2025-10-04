
import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import { sendInviteEmail } from "../utils/email.js";
import sqlite3 from "sqlite3";

const router = express.Router();

// Setup DB
const db = new sqlite3.Database("./vip_users.db");
db.run("CREATE TABLE IF NOT EXISTS users(email TEXT PRIMARY KEY, invite TEXT, expires_at INTEGER)");

// Discord Bot
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.DISCORD_BOT_TOKEN);

client.once("ready", () => console.log(`Discord bot logged in as ${client.user.tag}`));

// Endpoint to generate VIP invite
router.post("/generate", async (req, res) => {
  try {
    const { email } = req.body;
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    const channel = await guild.channels.fetch(process.env.DISCORD_CHANNEL_ID);

    const invite = await channel.createInvite({ maxAge: 2592000, maxUses: 1 }); // 30 days
    const expiresAt = Date.now() + 30*24*60*60*1000;

    db.run("INSERT OR REPLACE INTO users(email, invite, expires_at) VALUES (?, ?, ?)", [email, invite.url, expiresAt]);

    await sendInviteEmail(email, invite.url);
    res.json({ message: "VIP invite sent ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate invite" });
  }
});

export default router;
