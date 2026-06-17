"use server";

import { redirect } from "next/navigation";
import {
  checkAdminCredentials,
  setAdminSession,
  clearAdminSession,
} from "@/lib/admin-auth";

export type AdminLoginState = { error?: string };

export async function adminLogin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const user = String(formData.get("user") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!checkAdminCredentials(user, password)) {
    return { error: "Benutzername oder Passwort ist falsch." };
  }
  await setAdminSession();
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}
