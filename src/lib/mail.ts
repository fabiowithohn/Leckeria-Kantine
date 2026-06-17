import { Resend } from "resend";
import nodemailer from "nodemailer";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "Leckeria <onboarding@resend.dev>";

const resend = apiKey ? new Resend(apiKey) : null;

// SMTP (z. B. all-inkl). Aktiv, sobald SMTP_HOST + SMTP_USER + SMTP_PASS gesetzt sind.
const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpPort = Number(process.env.SMTP_PORT ?? "465");
const smtpEnabled = Boolean(smtpHost && smtpUser && smtpPass);

const smtpTransport = smtpEnabled
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // 465 = SSL, 587 = STARTTLS
      auth: { user: smtpUser, pass: smtpPass },
    })
  : null;

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Versendet eine E-Mail. Reihenfolge: SMTP (z. B. all-inkl) > Resend > Dev-Konsole.
 * Ist nichts konfiguriert, wird die Nachricht nur in die Server-Konsole geschrieben.
 */
export async function sendMail({ to, subject, html, replyTo }: SendArgs): Promise<void> {
  // 1) SMTP (all-inkl o. Ä.)
  if (smtpTransport) {
    await smtpTransport.sendMail({
      from,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    return;
  }

  // 2) Resend
  if (resend) {
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      throw new Error(`E-Mail-Versand fehlgeschlagen: ${error.message}`);
    }
    return;
  }

  // 3) Dev-Fallback: nur loggen
  console.log(
    "\n📧 [DEV-MAIL] Kein Mail-Versand konfiguriert – E-Mail wird nur geloggt:\n" +
      `   An:      ${to}\n` +
      `   Betreff: ${subject}\n` +
      (replyTo ? `   Reply-To: ${replyTo}\n` : "") +
      `   Inhalt:\n${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}\n`,
  );
}

export function verificationEmailHtml(name: string, link: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#7a1f1f">Willkommen bei der Kantine Grenzebach</h2>
      <p>Hallo ${escapeHtml(name)},</p>
      <p>bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren und
      Essen bestellen zu können:</p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#7a1f1f;color:#fff;padding:12px 22px;
        border-radius:8px;text-decoration:none;display:inline-block">
          E-Mail bestätigen
        </a>
      </p>
      <p style="color:#666;font-size:13px">Der Link ist 24 Stunden gültig.
      Falls du dich nicht registriert hast, ignoriere diese E-Mail.</p>
    </div>`;
}

export function accountApprovedEmailHtml(name: string, link: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#7a1f1f">Dein Konto ist freigeschaltet – Kantine Grenzebach</h2>
      <p>Hallo ${escapeHtml(name)},</p>
      <p>gute Nachrichten: Dein Konto wurde freigeschaltet. Du kannst dich ab
      sofort einloggen und dein Mittagessen bestellen.</p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#7a1f1f;color:#fff;padding:12px 22px;
        border-radius:8px;text-decoration:none;display:inline-block">
          Jetzt einloggen
        </a>
      </p>
      <p style="color:#666;font-size:13px">Guten Appetit – dein Leckeria-Team.</p>
    </div>`;
}

export function passwordResetEmailHtml(name: string, link: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#7a1f1f">Passwort zurücksetzen – Kantine Grenzebach</h2>
      <p>Hallo ${escapeHtml(name)},</p>
      <p>für dein Konto wurde das Zurücksetzen des Passworts angefordert.
      Klicke auf den folgenden Button, um ein neues Passwort zu vergeben:</p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#7a1f1f;color:#fff;padding:12px 22px;
        border-radius:8px;text-decoration:none;display:inline-block">
          Neues Passwort festlegen
        </a>
      </p>
      <p style="color:#666;font-size:13px">Der Link ist 1 Stunde gültig.
      Falls du das nicht angefordert hast, kannst du diese E-Mail ignorieren –
      dein Passwort bleibt unverändert.</p>
    </div>`;
}

export function contactConfirmationEmailHtml(name: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#7a1f1f">Vielen Dank für deine Anfrage!</h2>
      <p>Hallo ${escapeHtml(name)},</p>
      <p>vielen Dank für deine Nachricht an Leckeria. Deine Anfrage ist bei uns
      eingegangen – wir melden uns schnellstmöglich bei dir.</p>
      <p>Falls es eilt, erreichst du uns auch telefonisch oder per E-Mail.</p>
      <p style="margin-top:24px">Herzliche Grüße<br/>Dein Leckeria-Team</p>
      <p style="color:#888;font-size:12px;margin-top:24px">
        Dies ist eine automatische Eingangsbestätigung. Bitte antworte nicht
        direkt auf diese E-Mail.
      </p>
    </div>`;
}

export function contactEmailHtml(args: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#7a1f1f">Neue Nachricht über das Kontaktformular</h2>
      <p><strong>Name:</strong> ${escapeHtml(args.name)}</p>
      <p><strong>E-Mail:</strong> ${escapeHtml(args.email)}</p>
      ${args.phone ? `<p><strong>Telefon:</strong> ${escapeHtml(args.phone)}</p>` : ""}
      <p><strong>Nachricht:</strong></p>
      <p style="white-space:pre-wrap;background:#f6f3ee;padding:14px;border-radius:8px">${escapeHtml(
        args.message,
      )}</p>
    </div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
