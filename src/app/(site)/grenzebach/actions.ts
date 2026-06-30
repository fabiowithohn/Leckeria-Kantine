"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { sendMail, passwordResetEmailHtml } from "@/lib/mail";
import { createPasswordResetLink, consumePasswordResetToken } from "@/lib/password-reset";

export async function logoutEmployee(): Promise<void> {
  await signOut({ redirectTo: "/grenzebach/login" });
}

// ---------- Registrierung ----------
const registerSchema = z
  .object({
    firstName: z.string().min(1, "Bitte gib deinen Vornamen an."),
    lastName: z.string().min(1, "Bitte gib deinen Nachnamen an."),
    email: z.string().email("Bitte gib eine gültige E-Mail-Adresse an."),
    password: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen haben."),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Die Passwörter stimmen nicht überein.",
    path: ["passwordConfirm"],
  });

export type RegisterState = { ok?: boolean; error?: string };

export async function registerEmployee(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Eingabe ungültig." };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.approved) {
    return { error: "Für diese E-Mail existiert bereits ein freigeschaltetes Konto. Bitte einloggen." };
  }

  const firstName = parsed.data.firstName.trim();
  const lastName = parsed.data.lastName.trim();
  const name = `${firstName} ${lastName}`.trim();
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  // Konto anlegen bzw. (falls noch nicht freigeschaltet) aktualisieren.
  // Es gibt keine E-Mail-Bestätigung – der Zugang wird ausschließlich über die
  // Freischaltung im Backend gesteuert. Das Konto bleibt bis dahin gesperrt.
  await prisma.user.upsert({
    where: { email },
    update: { name, firstName, lastName, passwordHash, emailVerified: new Date() },
    create: { email, name, firstName, lastName, passwordHash, emailVerified: new Date() },
  });

  return { ok: true };
}

// ---------- E-Mail-Bestätigung ----------
export async function verifyEmailToken(
  token: string,
): Promise<{ ok: boolean; message: string }> {
  if (!token) return { ok: false, message: "Kein Token angegeben." };

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) {
    return { ok: false, message: "Dieser Bestätigungslink ist ungültig." };
  }
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return { ok: false, message: "Dieser Bestätigungslink ist abgelaufen. Bitte registriere dich erneut." };
  }

  await prisma.user.update({
    where: { email: record.email },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { email: record.email } });

  return {
    ok: true,
    message:
      "Deine E-Mail wurde bestätigt. Sobald wir dein Konto freigeschaltet haben, kannst du dich einloggen.",
  };
}

// ---------- Login ----------
export type LoginState = { error?: string };

export async function loginEmployee(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Bitte E-Mail und Passwort eingeben." };
  }

  // Freundliche Meldung, falls das Konto noch nicht freigeschaltet ist
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.approved) {
    return { error: "Dein Konto wurde noch nicht freigeschaltet. Wir prüfen deine Registrierung und schalten dich in Kürze frei." };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "E-Mail oder Passwort ist falsch." };
    }
    throw err;
  }

  redirect("/grenzebach");
}

// ---------- Passwort vergessen (Selbstbedienung) ----------
export type ForgotState = { ok?: boolean; error?: string };

export async function requestPasswordReset(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  if (!email) return { error: "Bitte gib deine E-Mail-Adresse an." };

  const user = await prisma.user.findUnique({ where: { email } });
  // Nur senden, wenn das Konto existiert – aber immer dieselbe Antwort zeigen,
  // damit keine Rückschlüsse auf vorhandene Konten möglich sind.
  if (user) {
    const link = await createPasswordResetLink(email);
    try {
      await sendMail({
        to: email,
        subject: "Passwort zurücksetzen – Kantine Grenzebach",
        html: passwordResetEmailHtml(user.firstName || user.name, link),
      });
    } catch (err) {
      // Antwort bleibt neutral (kein Rückschluss auf vorhandene Konten),
      // den Fehler aber serverseitig loggen, damit er in den Vercel-Logs sichtbar ist.
      console.error("[Passwort-Reset] Mailversand fehlgeschlagen:", err);
    }
  }
  return { ok: true };
}

// ---------- Passwort neu setzen ----------
const resetSchema = z
  .object({
    token: z.string().min(1, "Ungültiger Link."),
    password: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen haben."),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Die Passwörter stimmen nicht überein.",
    path: ["passwordConfirm"],
  });

export type ResetState = { ok?: boolean; error?: string };

export async function resetPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Eingabe ungültig." };
  }

  const res = await consumePasswordResetToken(parsed.data.token);
  if (!res.ok || !res.email) {
    return { error: res.message ?? "Dieser Link ist ungültig." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { email: res.email },
    // Reset bestätigt zugleich die E-Mail-Adresse (Zugriff aufs Postfach bewiesen)
    data: { passwordHash, emailVerified: new Date() },
  });
  await prisma.passwordResetToken.deleteMany({ where: { email: res.email } });

  return { ok: true };
}
