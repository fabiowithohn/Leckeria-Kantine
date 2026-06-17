"use client";

import { useState } from "react";
import { sendContactConfirmation } from "@/app/(site)/kontakt/actions";

// Web3Forms Access Key – per Design clientseitig (öffentlich) verwendbar.
const ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ||
  "15c8d8bc-e079-4d34-8177-449d1241d329";

const inputClass =
  "w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    setStatus("submitting");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `Kontaktanfrage von ${name}`,
          from_name: "Leckeria Website",
          replyto: email,
          name,
          email,
          phone,
          message,
        }),
      });
      const data = (await res.json()) as { success?: boolean };
      if (res.ok && data.success) {
        // Eingangsbestätigung an den Absender (über eigenen SMTP, best effort)
        await sendContactConfirmation({ name, email }).catch(() => {});
        form.reset();
        setStatus("success");
      } else {
        setStatus("error");
        setError("Nachricht konnte nicht gesendet werden. Bitte später erneut versuchen.");
      }
    } catch {
      setStatus("error");
      setError("Nachricht konnte nicht gesendet werden. Bitte prüfe deine Internetverbindung und versuche es erneut.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-herb-500/30 bg-herb-500/10 p-8 text-center">
        <p className="text-2xl">✅</p>
        <h3 className="mt-2 text-xl font-semibold text-ink">Vielen Dank!</h3>
        <p className="mt-2 text-ink-soft">
          Deine Nachricht ist bei uns eingegangen. Wir melden uns schnellstmöglich
          bei dir.
        </p>
      </div>
    );
  }

  const pending = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-xl bg-brand-100 px-4 py-3 text-sm font-medium text-brand-700">
          {error}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink" htmlFor="name">
            Name *
          </label>
          <input id="name" name="name" required minLength={2} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink" htmlFor="phone">
            Telefon *
          </label>
          <input id="phone" name="phone" type="tel" required minLength={5} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink" htmlFor="email">
          E-Mail *
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink" htmlFor="message">
          Deine Nachricht *
        </label>
        <textarea id="message" name="message" rows={5} required minLength={10} className={inputClass} />
      </div>
      <label htmlFor="privacy" className="flex items-start gap-3 text-sm text-ink-soft">
        <input
          id="privacy"
          name="privacy"
          type="checkbox"
          required
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-sand-300 accent-brand-500"
        />
        <span>
          Ich habe die{" "}
          <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 underline">
            Datenschutzerklärung
          </a>{" "}
          gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung meiner
          Anfrage zu. <span className="text-brand-600">*</span>
        </span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full bg-brand-700 px-7 py-3 text-sm font-semibold text-sand-50 shadow-sm transition hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? "Wird gesendet …" : "Nachricht senden"}
      </button>
    </form>
  );
}
