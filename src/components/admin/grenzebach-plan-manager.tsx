"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateGrenzebachPlan,
  removeGrenzebachPlan,
} from "@/app/admin/(panel)/admin-data-actions";

type State = { ok?: boolean; error?: string };

const input =
  "w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

export function GrenzebachPlanManager({
  hasFile,
  title,
  version,
}: {
  hasFile: boolean;
  title: string | null;
  version: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<State, FormData>(updateGrenzebachPlan, {});
  const [removing, startRemove] = useTransition();

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-5">
      <p className="text-sm font-bold text-ink">Wöchentlicher Speiseplan (PDF)</p>
      <p className="mt-1 text-sm text-ink-soft">
        Wird im Mitarbeiter-Bereich zum Download angeboten – z. B. zum Ausdrucken
        für Gäste ohne eigenen Login.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {hasFile ? (
          <a
            href={`/api/grenzebach-plan?v=${encodeURIComponent(version)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-sand-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-sand-100"
          >
            📄 Aktuelles PDF ansehen
          </a>
        ) : (
          <span className="rounded-full bg-sand-100 px-4 py-2 text-sm text-ink-soft">
            Noch kein Plan hochgeladen.
          </span>
        )}
        {hasFile && (
          <button
            type="button"
            disabled={removing}
            onClick={() => {
              if (confirm("Aktuellen Wochenplan (PDF) entfernen?")) {
                startRemove(async () => {
                  await removeGrenzebachPlan();
                  router.refresh();
                });
              }
            }}
            className="rounded-full border border-brand-200 px-4 py-2 text-sm text-brand-700 hover:bg-brand-50 disabled:opacity-60"
          >
            Entfernen
          </button>
        )}
      </div>

      <form action={action} className="mt-5 border-t border-sand-200 pt-4">
        {state.ok && (
          <p className="mb-3 rounded-xl bg-herb-500/10 px-4 py-3 text-sm font-medium text-herb-600">
            Wochenplan aktualisiert. ✅
          </p>
        )}
        {state.error && (
          <p className="mb-3 rounded-xl bg-brand-100 px-4 py-3 text-sm font-medium text-brand-700">
            {state.error}
          </p>
        )}

        <label className="mb-1 block text-sm font-medium text-ink" htmlFor="plan-title">
          Wochenangabe (optional)
        </label>
        <input
          id="plan-title"
          name="title"
          defaultValue={title ?? ""}
          placeholder="z. B. KW 25 · 16.–20.06."
          className={input}
        />

        <label className="mb-1 mt-4 block text-sm font-medium text-ink" htmlFor="plan-file">
          Plan als PDF
        </label>
        <input
          id="plan-file"
          name="file"
          type="file"
          accept="application/pdf,.pdf"
          className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-brand-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand-700"
        />

        <button
          type="submit"
          disabled={pending}
          className="mt-4 rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white shadow-warm transition hover:bg-brand-600 disabled:opacity-60"
        >
          {pending ? "Wird gespeichert …" : "Wochenplan speichern"}
        </button>
      </form>
    </div>
  );
}
