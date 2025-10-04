// utils/discord.js
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN);

// Assign VIP role
export async function assignVipRole(userId) {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
    const member = await guild.members.fetch(userId);
    await member.roles.add(process.env.VIP_ROLE_ID);
    console.log(`VIP role added to ${userId}`);
  } catch (err) {
    console.error("Error adding VIP role:", err);
  }
}

// Remove VIP role
export async function removeVipRole(userId) {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
    const member = await guild.members.fetch(userId);
    await member.roles.remove(process.env.VIP_ROLE_ID);
    console.log(`VIP role removed from ${userId}`);
  } catch (err) {
    console.error("Error removing VIP role:", err);
  }
}

// Create unique invite
export async function createUniqueInvite() {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
    const channel = await guild.channels.fetch(process.env.DISCORD_CHANNEL_ID);
    const invite = await channel.createInvite({ maxUses: 1, unique: true, maxAge: 2592000 }); // 30 days
    return invite.url;
  } catch (err) {
    console.error("Error creating invite:", err);
    return null;
  }
}
