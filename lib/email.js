import 'server-only';
import nodemailer from 'nodemailer';

// Email through Gmail SMTP. Runs on the server only: the password is never sent to the browser,
// and nothing here is reachable from the browser except through the server actions that call it.
// Does nothing until GMAIL_USER and GMAIL_APP_PASSWORD are set, and never stops an order from going through.
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// One plain address only: no commas, semicolons, angle brackets, spaces or line breaks,
// so a customer cannot turn the order form into a way to mail other people or inject headers.
export const isEmail = (v) => typeof v === 'string' && v.length <= 120 && /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(v);

const textOf = (html) => String(html).replace(/<(br|\/p|\/li|\/tr|\/h\d)\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n{3,}/g, '\n\n').trim();

// Gmail SMTP. Needs a Google account with 2-Step Verification and an App Password (not the normal password).
// Gmail allows about 500 emails a day, so the site only sends what matters: one email per order.
let transport;
function mailer() {
  const user = process.env.GMAIL_USER, pass = String(process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (!user || !pass) return null;
  if (!transport) {
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com', port: Number(process.env.SMTP_PORT || 465), secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user, pass }, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 12000,
    });
  }
  return transport;
}
export const emailEnabled = () => !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

export async function sendEmail({ to, subject, html, text, replyTo }) {
  const t = mailer();
  if (!t || !isEmail(to)) return { ok: false, skipped: true };
  const user = process.env.GMAIL_USER;
  // Gmail only sends from the signed-in address (or an alias set up in Gmail), so the name is the only thing we choose.
  const from = process.env.EMAIL_FROM && /<[^>]+@[^>]+>/.test(process.env.EMAIL_FROM) ? process.env.EMAIL_FROM : `"${String(process.env.EMAIL_FROM_NAME || 'Himalayan').replace(/["\r\n]/g, '')}" <${user}>`;
  try {
    await t.sendMail({ from, to, subject: String(subject).replace(/[\r\n]+/g, ' ').slice(0, 200), html, text: text || textOf(html), ...(isEmail(replyTo) ? { replyTo } : {}) });
    return { ok: true };
  } catch (err) {
    console.error('[email] Gmail refused or could not send:', err?.code || '', err?.responseCode || '', String(err?.message || '').slice(0, 200));
    return { ok: false };
  }
}

// Shared look for every email: rust header, white card, plain footer. Inline styles only, which is what mail apps support.
export function emailLayout({ name, heading, preheader = '', body, footer = '' }) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f6f1ec;font-family:Arial,Helvetica,sans-serif;color:#2b1810;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1ec;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #eadfd6;">
<tr><td style="background:#2b1810;padding:20px 26px;"><div style="font-family:Georgia,serif;font-size:22px;color:#ffffff;font-weight:bold;">${esc(name)}</div><div style="height:3px;width:46px;background:#ffd21a;margin-top:10px;"></div></td></tr>
<tr><td style="padding:26px;"><h1 style="font-family:Georgia,serif;font-size:24px;line-height:1.25;margin:0 0 14px;color:#2b1810;">${esc(heading)}</h1>${body}</td></tr>
<tr><td style="padding:16px 26px 22px;border-top:1px solid #eadfd6;font-size:12px;line-height:1.6;color:#7a675b;">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}
