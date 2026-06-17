"use client";

import { useActionState } from "react";
import { adminLogin, type AdminLoginState } from "@/app/admin/actions";

const inputClass =
  "w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState<AdminLoginState, FormData>(
    adminLogin,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded-xl bg-brand-100 px-4 py-3 text-sm font-medium text-brand-700">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="user" className="mb-1 block text-sm font-medium text-ink">
          Benutzername
        </label>
        <input id="user" name="user" required autoFocus className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
          Passwort
        </label>
        <input id="password" name="password" type="password" required className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-500 shadow-warm px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? "Anmeldung …" : "Anmelden"}
      </button>
    </form>
  );
}
