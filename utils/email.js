import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

export const sendInviteEmail = async (to, inviteUrl) => {
  await transporter.sendMail({
    from: `"VIP Crypto Bot" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your VIP Discord Invite 🎉",
    html: `<p>Thank you for subscribing! Click the link below to join VIP:</p>
           <a href="${inviteUrl}">Join VIP Discord</a>`
  });
};
