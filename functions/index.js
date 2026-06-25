/**
 * Contact-form Cloud Function for the Matt Warnock author site.
 *
 * The contact page POSTs JSON ({ name, email, message, company }) to /api/contact,
 * which firebase.json rewrites to this function. It validates the input, drops bot
 * submissions (honeypot), and emails the message to Matt over SMTP.
 *
 * SETUP (one time):
 *   1. Choose an SMTP sender. Easiest options:
 *      - A Gmail account with an App Password (https://myaccount.google.com/apppasswords)
 *      - A transactional provider (Mailgun, SendGrid, Postmark, Resend, etc.)
 *   2. Store the credentials as secrets:
 *        firebase functions:secrets:set SMTP_USER
 *        firebase functions:secrets:set SMTP_PASS
 *   3. Set the non-secret params (host, port, to, from) in .env or via the dashboard.
 *      See functions/.env.example.
 *   4. Deploy:  firebase deploy --only functions
 *
 * Requires the Firebase Blaze (pay-as-you-go) plan, which Cloud Functions need.
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");

// Secrets (set with `firebase functions:secrets:set ...`)
const SMTP_USER = defineSecret("SMTP_USER");
const SMTP_PASS = defineSecret("SMTP_PASS");

// Non-secret config (set in functions/.env or the console)
const SMTP_HOST = defineString("SMTP_HOST", { default: "smtp.gmail.com" });
const SMTP_PORT = defineString("SMTP_PORT", { default: "465" });
const CONTACT_TO = defineString("CONTACT_TO", { default: "matt@mattwarnockauthor.com" });
const CONTACT_FROM = defineString("CONTACT_FROM", {
  default: "Matt Warnock Site <no-reply@mattwarnockauthor.com>",
});

const clean = (s) => String(s || "").trim();
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

exports.contact = onRequest(
  { secrets: [SMTP_USER, SMTP_PASS], cors: true, region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const body = req.body || {};
    const name = clean(body.name);
    const email = clean(body.email);
    const message = clean(body.message);
    const honeypot = clean(body.company); // should always be empty

    // Bot caught the honeypot — pretend success, send nothing.
    if (honeypot) {
      logger.info("Honeypot triggered; dropping submission.");
      return res.status(200).json({ ok: true });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: "Missing required fields." });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ ok: false, error: "Invalid email address." });
    }
    if (message.length > 5000) {
      return res.status(400).json({ ok: false, error: "Message is too long." });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST.value(),
        port: Number(SMTP_PORT.value()),
        secure: Number(SMTP_PORT.value()) === 465,
        auth: { user: SMTP_USER.value(), pass: SMTP_PASS.value() },
      });

      await transporter.sendMail({
        from: CONTACT_FROM.value(),
        to: CONTACT_TO.value(),
        replyTo: `${name} <${email}>`,
        subject: `New message from ${name} — mattwarnockauthor.com`,
        text: `From: ${name} <${email}>\n\n${message}`,
        html: `
          <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
          <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        `,
      });

      return res.status(200).json({ ok: true });
    } catch (err) {
      logger.error("Failed to send contact email", err);
      return res.status(500).json({ ok: false, error: "Failed to send message." });
    }
  }
);
