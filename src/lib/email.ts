// src/lib/email.ts
import nodemailer from 'nodemailer';

type Attachment = {
  filename: string;
  content?: string | Buffer;      // e.g. ICS string or Buffer
  path?: string;                  // or a file/URL path
  contentType?: string;           // e.g. 'text/calendar'
  cid?: string;                   // for inline images if you ever need it
};

type MailOpts = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;                  // default set below
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Attachment[];
};

// ---- SMTP config (Zoho) ----
// Defaults target Zoho EU. Override with env if needed.
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.zoho.eu'; // 'smtp.zoho.com' for US region
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);    // 465 (secure) or 587 (STARTTLS)
const SMTP_SECURE = process.env.SMTP_SECURE
  ? /^true$/i.test(process.env.SMTP_SECURE)
  : SMTP_PORT === 465;

const SMTP_USER = process.env.EMAIL_USER || '';
const SMTP_PASS = process.env.EMAIL_PASS || '';

const FROM_FALLBACK = SMTP_USER ? `Hull Tattoo Studio <${SMTP_USER}>` : 'Hull Tattoo Studio <no-reply@hulltattoostudio.com>';

// Re-use the same transporter across invocations (good for serverless)
const transporter = ((): nodemailer.Transporter | null => {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[email] EMAIL_USER/EMAIL_PASS not set — emails will be skipped.');
    return null;
  }
  const t = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: {
      // Keep TLS modern and compatible with Zoho
      minVersion: 'TLSv1.2',
    },
  });
  return t;
})();

// quick plain-text fallback from HTML (very basic)
function htmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

/**
 * Send an email using Zoho SMTP.
 * - Uses EMAIL_USER/EMAIL_PASS
 * - Supports HTML + optional text
 * - Supports attachments (e.g. ICS)
 */
export async function sendMail(opts: MailOpts) {
  if (!transporter) {
    console.warn('[email] Transporter not configured; skipping send.', { to: opts.to, subject: opts.subject });
    return { skipped: true };
  }

  const {
    to,
    subject,
    html,
    text,
    from = FROM_FALLBACK,
    replyTo,
    cc,
    bcc,
    attachments,
  } = opts;

  // Build nodemailer payload
  const message: nodemailer.SendMailOptions = {
    from,
    to,
    subject,
    html,
    text: text || htmlToText(html),
    replyTo,
    cc,
    bcc,
    attachments: attachments?.map(a => ({
      filename: a.filename,
      content: a.content,
      path: a.path,
      contentType: a.contentType,
      cid: a.cid,
    })),
  };

  try {
    const info = await transporter.sendMail(message);
    // Optional: log the messageId for delivery tracing
    console.log('[email] sent', { messageId: info.messageId, to });
    return { ok: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[email] send failed', err?.message || err, err?.stack);
    throw err;
  }
}
