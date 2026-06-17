"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  registerEmployee,
  loginEmployee,
  requestPasswordReset,
  resetPassword,
  type RegisterState,
  type LoginState,
  type ForgotState,
  type ResetState,
} from "@/app/(site)/grenzebach/actions";

const inputClass =
  "w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="rounded-xl bg-brand-100 px-4 py-3 text-sm font-medium text-brand-700">
      {message}
    </p>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(
    registerEmployee,
    {},
  );

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-herb-500/30 bg-herb-500/10 p-6 text-center">
        <p className="text-2xl">✅</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">Registrierung eingegangen!</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Vielen Dank. Wir prüfen deine Registrierung und schalten dein Konto in
          Kürze frei. Sobald es freigeschaltet ist, kannst du dich einloggen und
          dein Mittagessen bestellen.
        </p>
        <Link href="/grenzebach/login" className="mt-4 inline-block text-sm font-semibold text-brand-700 underline">
          Zum Login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state.error && <ErrorBox message={state.error} />}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-ink">Vorname</label>
          <input id="firstName" name="firstName" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-ink">Nachname</label>
          <input id="lastName" name="lastName" required className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">E-Mail</label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">Passwort</label>
        <input id="password" name="password" type="password" required minLength={8} className={inputClass} />
      </div>
      <div>
        <label htmlFor="passwordConfirm" className="mb-1 block text-sm font-medium text-ink">Passwort wiederholen</label>
        <input id="passwordConfirm" name="passwordConfirm" type="password" required className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-500 shadow-warm px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? "Wird registriert …" : "Konto erstellen"}
      </button>
      <p className="text-center text-sm text-ink-soft">
        Bereits registriert?{" "}
        <Link href="/grenzebach/login" className="font-semibold text-brand-700 underline">
          Jetzt einloggen
        </Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginEmployee,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      {state.error && <ErrorBox message={state.error} />}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">E-Mail</label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">Passwort</label>
        <input id="password" name="password" type="password" required className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-500 shadow-warm px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? "Anmeldung …" : "Einloggen"}
      </button>
      <p className="text-center text-sm text-ink-soft">
        Noch kein Konto?{" "}
        <Link href="/grenzebach/register" className="font-semibold text-brand-700 underline">
          Jetzt registrieren
        </Link>
      </p>
      <p className="text-center text-sm text-ink-soft">
        <Link href="/grenzebach/passwort-vergessen" className="font-semibold text-brand-700 underline">
          Passwort vergessen?
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(
    requestPasswordReset,
    {},
  );

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-herb-500/30 bg-herb-500/10 p-6 text-center">
        <p className="text-2xl">📩</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">E-Mail unterwegs</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir einen
          Link zum Zurücksetzen deines Passworts geschickt. Bitte prüfe dein
          Postfach.
        </p>
        <Link href="/grenzebach/login" className="mt-4 inline-block text-sm font-semibold text-brand-700 underline">
          Zurück zum Login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state.error && <ErrorBox message={state.error} />}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">E-Mail</label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-500 shadow-warm px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? "Wird gesendet …" : "Link anfordern"}
      </button>
      <p className="text-center text-sm text-ink-soft">
        <Link href="/grenzebach/login" className="font-semibold text-brand-700 underline">
          Zurück zum Login
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(
    resetPassword,
    {},
  );

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-herb-500/30 bg-herb-500/10 p-6 text-center">
        <p className="text-2xl">✅</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">Passwort geändert</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Dein Passwort wurde erfolgreich gesetzt. Du kannst dich jetzt mit dem
          neuen Passwort anmelden.
        </p>
        <Link href="/grenzebach/login" className="mt-4 inline-block text-sm font-semibold text-brand-700 underline">
          Zum Login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state.error && <ErrorBox message={state.error} />}
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">Neues Passwort</label>
        <input id="password" name="password" type="password" required minLength={8} className={inputClass} />
      </div>
      <div>
        <label htmlFor="passwordConfirm" className="mb-1 block text-sm font-medium text-ink">Passwort wiederholen</label>
        <input id="passwordConfirm" name="passwordConfirm" type="password" required className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-500 shadow-warm px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? "Wird gespeichert …" : "Neues Passwort speichern"}
      </button>
    </form>
  );
}
