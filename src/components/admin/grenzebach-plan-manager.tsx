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
      <p className="text-sm font-bold text-ink">Wöchentlicher Speiseplan (Bild)</p>
      <p className="mt-1 text-sm text-ink-soft">
        Wird im Mitarbeiter-Bereich zum Download angeboten – z. B. zum Ausdrucken
        für Gäste ohne eigenen Login.
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {/* Aktuelles Bild */}
        <div>
          <p className="mb-2 text-xs font-semibold text-ink-soft">Aktueller Plan</p>
          {hasFile ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/grenzebach-plan?v=${encodeURIComponent(version)}`}
              alt="Aktueller Wochenplan Grenzebach"
              className="w-full rounded-2xl border border-sand-200 shadow-sm"
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-sand-300 p-10 text-center text-ink-soft">
              Noch kein Plan hochgeladen.
            </div>
          )}
          {hasFile && (
            <button
              type="button"
              disabled={removing}
              onClick={() => {
                if (confirm("Aktuellen Wochenplan entfernen?")) {
                  startRemove(async () => {
                    await removeGrenzebachPlan();
                    router.refresh();
                  });
                }
              }}
              className="mt-2 rounded-full border border-brand-200 px-4 py-1.5 text-sm text-brand-700 hover:bg-brand-50 disabled:opacity-60"
            >
              Entfernen
            </button>
          )}
        </div>

        {/* Upload-Formular */}
        <form action={action}>
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

          <label className="mb-1 mt-4 block text-sm font-medium text-ink" htmlFor="plan-image">
            Plan-Bild (JPG/PNG)
          </label>
          <input
            id="plan-image"
            name="image"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-brand-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand-700"
          />
          <p className="mt-1 text-xs text-ink-soft">
            Das Bild wird automatisch optimiert.
          </p>

          <button
            type="submit"
            disabled={pending}
            className="mt-4 rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white shadow-warm transition hover:bg-brand-600 disabled:opacity-60"
          >
            {pending ? "Wird gespeichert …" : "Wochenplan speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}
