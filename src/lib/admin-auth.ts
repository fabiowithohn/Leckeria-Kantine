import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Eigenständige Admin-Session (getrennt vom Mitarbeiter-Login).
// Cookie enthält ein HMAC-signiertes Ablaufdatum plus Rolle und Benutzername.
const COOKIE_NAME = "leckeria_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 Stunden

/**
 * Rollen im Backend:
 * - "admin":   alle bisherigen Bereiche (Gerichte, Mitarbeitende, Bestellungen, …)
 * - "planner": wie admin, zusätzlich der Bereich „Planerstellung“
 */
export type AdminRole = "admin" | "planner";
export type AdminSession = { user: string; role: AdminRole };

function secret(): string {
  return process.env.AUTH_SECRET ?? "dev-secret";
}

function sign(payload: string): string {
  const sig = crypto
    .createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

/** Prüft Signatur und Ablauf; liefert die Session oder null. */
function verify(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto
    .createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");
  try {
    if (
      sig.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    ) {
      return null;
    }
  } catch {
    return null;
  }
  // Payload: "<ablauf-ms>|<rolle>|<benutzer>" (ältere Cookies ohne Rolle gelten als admin)
  const [expRaw, roleRaw, ...userParts] = payload.split("|");
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || Date.now() >= exp) return null;
  const role: AdminRole = roleRaw === "planner" ? "planner" : "admin";
  return { user: userParts.join("|") || "admin", role };
}

/** Zerlegt "user1:pass1,user2:pass2" in Paare (Benutzer/Passwort ohne ":" oder ","). */
function parseLogins(raw: string | undefined): { user: string; pass: string }[] {
  const out: { user: string; pass: string }[] = [];
  for (const pair of (raw ?? "").split(",")) {
    const sep = pair.indexOf(":");
    if (sep < 0) continue;
    const user = pair.slice(0, sep).trim();
    const pass = pair.slice(sep + 1).trim();
    if (user && pass) out.push({ user, pass });
  }
  return out;
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

/**
 * Prüft Zugangsdaten und liefert die Session (Benutzer + Rolle) oder null.
 *
 * - ADMIN_USER / ADMIN_PASSWORD: primärer Admin
 * - ADMIN_LOGINS:   weitere Admin-Zugänge, Format "user:pass,user2:pass2"
 * - PLANNER_LOGINS: Zugänge mit Rolle "planner" (sehen zusätzlich die Planerstellung),
 *                   gleiches Format – z. B. "bekki:…"
 */
export function checkAdminCredentials(user: string, password: string): AdminSession | null {
  if (!password) return null;

  const primaryUser = process.env.ADMIN_USER ?? "admin";
  const primaryPass = process.env.ADMIN_PASSWORD ?? "";
  if (primaryPass && user === primaryUser && safeEqual(password, primaryPass)) {
    return { user, role: "admin" };
  }

  for (const l of parseLogins(process.env.PLANNER_LOGINS)) {
    if (user === l.user && safeEqual(password, l.pass)) return { user, role: "planner" };
  }
  for (const l of parseLogins(process.env.ADMIN_LOGINS)) {
    if (user === l.user && safeEqual(password, l.pass)) return { user, role: "admin" };
  }
  return null;
}

export async function setAdminSession(session: AdminSession): Promise<void> {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const store = await cookies();
  store.set(COOKIE_NAME, sign(`${exp}|${session.role}|${session.user}`), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Aktuelle Backend-Session (oder null, wenn nicht angemeldet / abgelaufen). */
export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  return verify(store.get(COOKIE_NAME)?.value);
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminSession()) != null;
}

/** Nur die Rolle "planner" darf die Planerstellung sehen und nutzen. */
export async function isPlanner(): Promise<boolean> {
  return (await getAdminSession())?.role === "planner";
}

/**
 * Für Server-Actions/Route-Handler: erzwingt eine gültige Admin-Sitzung.
 * Bei abgelaufener/fehlender Sitzung → freundliche Weiterleitung zum Login.
 * Andernfalls gleitende Verlängerung (Sitzung wird zurückgesetzt).
 * NICHT im Render einer Server-Component aufrufen (setzt ein Cookie).
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login?expired=1");
  await setAdminSession(session);
  return session;
}

/** Wie requireAdmin, zusätzlich muss die Rolle "planner" vorliegen. */
export async function requirePlanner(): Promise<AdminSession> {
  const session = await requireAdmin();
  if (session.role !== "planner") redirect("/admin");
  return session;
}
