import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createTransport } from '../config/mail.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'templates');
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const render = (file, vars) =>
  fs.readFileSync(path.join(dir, file), 'utf8').replace(/{{(\w+)}}/g, (_, k) => escapeHtml(vars[k] ?? ''));

const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

const sendEmail = async ({ to, subject, html, link }) => {
  const transport = createTransport();
  if (!transport) {
    // No SMTP set up: show the link in the server console (development only)
    if (process.env.NODE_ENV !== 'production') console.log(`\n[email not sent: SMTP not configured]\nTo: ${to}\nSubject: ${subject}\nLink: ${link}\n`);
    else console.warn(`SMTP not configured; email "${subject}" was not sent`);
    return;
  }
  await transport.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
};

export const sendVerificationEmail = (user, token) => {
  const link = `${clientUrl()}/verify-email/${token}`;
  return sendEmail({ to: user.email, subject: 'Verify your email', link, html: render('verifyEmail.html', { name: user.name, link }) });
};

export const sendPasswordResetEmail = (user, token) => {
  const link = `${clientUrl()}/reset-password/${token}`;
  return sendEmail({ to: user.email, subject: 'Reset your password', link, html: render('passwordReset.html', { name: user.name, link }) });
};
