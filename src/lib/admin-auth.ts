import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Eigenständige Admin-Session (getrennt vom Mitarbeiter-Login).
// Cookie enthält ein HMAC-signiertes Ablaufdatum.
const COOKIE_NAME = "leckeria_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 Stunden

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

function verify(token: string | undefined): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;
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
      return false;
    }
  } catch {
    return false;
  }
  const exp = Number(payload);
  return Number.isFinite(exp) && Date.now() < exp;
}

export function checkAdminCredentials(user: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USER ?? "admin";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";
  return user === expectedUser && password === expectedPass && expectedPass !== "";
}

export async function setAdminSession(): Promise<void> {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const store = await cookies();
  store.set(COOKIE_NAME, sign(String(exp)), {
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

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verify(store.get(COOKIE_NAME)?.value);
}

/**
 * Für Server-Actions/Route-Handler: erzwingt eine gültige Admin-Sitzung.
 * Bei abgelaufener/fehlender Sitzung → freundliche Weiterleitung zum Login.
 * Andernfalls gleitende Verlängerung (Sitzung wird zurückgesetzt).
 * NICHT im Render einer Server-Component aufrufen (setzt ein Cookie).
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login?expired=1");
  await setAdminSession();
}
