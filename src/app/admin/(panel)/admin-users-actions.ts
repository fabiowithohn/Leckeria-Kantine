"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { createPasswordResetLink } from "@/lib/password-reset";
import { sendMail, passwordResetEmailHtml, accountApprovedEmailHtml } from "@/lib/mail";

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export type UserActionResult = {
  ok?: boolean;
  error?: string;
  resetLink?: string;
  mailSent?: boolean;
  mailError?: string;
};

/** Vor- und Nachname eines Mitarbeiters ändern (auf dessen Anfrage per Mail). */
export async function updateUserName(
  userId: string,
  formData: FormData,
): Promise<UserActionResult> {
  await requireAdmin();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  if (!firstName || !lastName) {
    return { error: "Bitte Vor- und Nachname angeben." };
  }
  const name = `${firstName} ${lastName}`.trim();
  await prisma.user.update({
    where: { id: userId },
    data: { firstName, lastName, name },
  });
  revalidatePath("/admin/benutzer");
  return { ok: true };
}

/** Löscht ein Mitarbeiter-Konto endgültig (inkl. zugehöriger Bestellungen via Cascade). */
export async function deleteUser(userId: string): Promise<UserActionResult> {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) return { error: "Mitarbeiter nicht gefunden." };
  // Offene Reset-/Bestätigungs-Tokens dieser E-Mail mit aufräumen
  await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });
  await prisma.verificationToken.deleteMany({ where: { email: user.email } });
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/benutzer");
  return { ok: true };
}

/** Schaltet ein Konto frei oder entzieht die Freischaltung (sperrt den Login). */
export async function setUserApproval(
  userId: string,
  approved: boolean,
): Promise<UserActionResult> {
  await requireAdmin();
  const user = await prisma.user.update({
    where: { id: userId },
    data: { approved },
    select: { email: true, firstName: true, name: true },
  });

  // Bei Freischaltung den Mitarbeiter benachrichtigen (best effort).
  if (approved) {
    try {
      await sendMail({
        to: user.email,
        subject: "Dein Konto ist freigeschaltet – Kantine Grenzebach",
        html: accountApprovedEmailHtml(
          user.firstName || user.name,
          `${appUrl()}/grenzebach/login`,
        ),
      });
    } catch (err) {
      // Mailversand evtl. nicht konfiguriert – Freischaltung gilt trotzdem.
      console.error("[Freischaltung] Mailversand fehlgeschlagen:", err);
    }
  }
  revalidatePath("/admin/benutzer");
  return { ok: true };
}

/**
 * Setzt das Passwort eines Mitarbeiters zurück: erzeugt einen einmaligen
 * Reset-Link (1 h gültig), schickt ihn per E-Mail an den Nutzer und gibt ihn
 * zusätzlich zurück, damit der Admin ihn bei Bedarf manuell weiterleiten kann.
 * Es wird KEIN Passwort gesetzt – der Nutzer vergibt selbst ein neues.
 */
export async function adminResetUserPassword(
  userId: string,
): Promise<UserActionResult> {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Mitarbeiter nicht gefunden." };

  const link = await createPasswordResetLink(user.email);
  let mailSent = false;
  let mailError: string | undefined;
  try {
    await sendMail({
      to: user.email,
      subject: "Passwort zurücksetzen – Kantine Grenzebach",
      html: passwordResetEmailHtml(user.firstName || user.name, link),
    });
    mailSent = true;
  } catch (err) {
    // Mailversand evtl. nicht konfiguriert – Link wird dem Admin trotzdem angezeigt.
    mailError = err instanceof Error ? err.message : String(err);
    console.error("[Admin-Passwort-Reset] Mailversand fehlgeschlagen:", err);
  }
  revalidatePath("/admin/benutzer");
  return { ok: true, resetLink: link, mailSent, mailError };
}
