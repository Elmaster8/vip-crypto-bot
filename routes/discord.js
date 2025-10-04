import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.login(process.env.DISCORD_BOT_TOKEN);

client.once("ready", () => {
  console.log(`Discord bot logged in as ${client.user.tag}`);
});

export async function assignVipRole(discordId) {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
    const member = await guild.members.fetch(discordId);
    await member.roles.add(process.env.VIP_ROLE_ID);
    console.log(`VIP role assigned to ${discordId}`);
  } catch (err) {
    console.error("Error assigning VIP role:", err);
  }
}

export async function removeVipRole(discordId) {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_SERVER_ID);
    const member = await guild.members.fetch(discordId);
    await member.roles.remove(process.env.VIP_ROLE_ID);
    console.log(`VIP role removed from ${discordId}`);
  } catch (err) {
    console.error("Error removing VIP role:", err);
  }
}

export async function createUniqueInvite(channelId) {
  try {
    const channel = await client.channels.fetch(channelId);
    const invite = await channel.createInvite({ maxUses: 1, unique: true, maxAge: 30*24*60*60 }); // 30 days
    return invite.url;
  } catch (err) {
    console.error("Error creating invite:", err);
    return null;
  }
}
