
import sqlite3 from "sqlite3";
import { sendReminderEmail } from "./email.js";

const db = new sqlite3.Database("./db/vip_users.db");

export function notifyExpiringUsers() {
  const fiveDaysLaterStart = Date.now() + 5*24*60*60*1000;
  const fiveDaysLaterEnd = fiveDaysLaterStart + 24*60*60*1000; // 1-day window

  db.all(
    "SELECT * FROM users WHERE expires_at BETWEEN ? AND ?",
    [fiveDaysLaterStart, fiveDaysLaterEnd],
    (err, rows) => {
      if(err) return console.error("Error fetching expiring users:", err);

      rows.forEach(user => {
        sendReminderEmail(user.email, user.expires_at);
      });

      if(rows.length) console.log(`Sent ${rows.length} expiration reminders`);
    }
  );
}
