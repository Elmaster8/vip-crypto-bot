import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

export async function sendInviteEmail(to, inviteLink) {
  try {
    await transporter.sendMail({
      from: `"VIP Crypto Bot" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: "Your VIP Discord Invite",
      html: `<p>Congratulations! Your VIP access is now active.</p>
             <p>Here is your <b>unique Discord invite:</b> <a href="${inviteLink}">${inviteLink}</a></p>
             <p>Enjoy your VIP benefits for 30 days.</p>`
    });
    console.log(`Invite email sent to ${to}`);
  } catch(err) {
    console.error("Error sending invite email:", err);
  }
}

export async function sendReminderEmail(to, expiresAt) {
  try {
    const dateStr = new Date(expiresAt).toLocaleDateString();
    await transporter.sendMail({
      from: `"VIP Crypto Bot" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: "VIP Access Expiring Soon",
      html: `<p>Your VIP access will expire on <b>${dateStr}</b>.</p>
             <p>Renew now to keep your VIP benefits active!</p>`
    });
    console.log(`Reminder email sent to ${to}`);
  } catch(err) {
    console.error("Error sending reminder email:", err);
  }
}
