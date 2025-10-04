// utils/discord.js
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Exported functions to match what payments.js expects
export const assignVipRole = async (userId) => {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
    const member = await guild.members.fetch(userId);
    await member.roles.add(process.env.VIP_ROLE_ID);
    console.log(`VIP role added to ${userId}`);
  } catch (err) {
    console.error("Error adding VIP role:", err);
  }
};

export const removeVipRole = async (userId) => {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
    const member = await guild.members.fetch(userId);
    await member.roles.remove(process.env.VIP_ROLE_ID);
    console.log(`VIP role removed from ${userId}`);
  } catch (err) {
    console.error("Error removing VIP role:", err);
  }
};

export const createUniqueInvite = async () => {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
    const channel = await guild.channels.fetch(process.env.YOUR_DISCORD_CHANNEL_ID);
    const invite = await channel.createInvite({ maxUses: 1, unique: true, maxAge: 2592000 }); // 30 days
    return invite.url;
  } catch (err) {
    console.error("Error creating invite:", err);
    return null;
  }
};
