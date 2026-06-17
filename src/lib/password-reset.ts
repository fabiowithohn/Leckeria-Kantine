import crypto from "node:crypto";
import { prisma } from "@/lib/db";

// Passwort-Reset-Links sind 1 Stunde gültig.
const RESET_TTL_MS = 60 * 60 * 1000;

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

/**
 * Erzeugt ein neues Reset-Token für die angegebene E-Mail (alte werden entfernt)
 * und gibt den vollständigen Reset-Link zurück.
 */
export async function createPasswordResetLink(email: string): Promise<string> {
  await prisma.passwordResetToken.deleteMany({ where: { email } });
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: { email, token, expires: new Date(Date.now() + RESET_TTL_MS) },
  });
  return `${appUrl()}/grenzebach/reset?token=${token}`;
}

/** Prüft ein Reset-Token. Gibt bei Gültigkeit die zugehörige E-Mail zurück. */
export async function consumePasswordResetToken(
  token: string,
): Promise<{ ok: boolean; email?: string; message?: string }> {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record) return { ok: false, message: "Dieser Link ist ungültig." };
  if (record.expires < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } }).catch(() => {});
    return {
      ok: false,
      message: "Dieser Link ist abgelaufen. Bitte fordere einen neuen an.",
    };
  }
  return { ok: true, email: record.email };
}
