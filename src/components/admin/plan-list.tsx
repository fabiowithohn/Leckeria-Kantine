"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPlan } from "@/app/admin/(panel)/admin-plan-actions";
import { isoWeekOf, todayISO, weekTitle } from "@/lib/meal-plan";

export type PlanListRow = {
  id: string;
  canteen: string;
  year: number;
  week: number;
  updatedAt: string;
  exportCount: number;
};

const input =
  "w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

/** Nächster Montag ab heute (heute, falls Montag) als ISO-Datum. */
function nextMondayISO(): string {
  const today = todayISO();
  const [y, m, d] = today.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + (day === 1 ? 0 : 8 - day));
  return date.toISOString().slice(0, 10);
}

export function PlanList({ plans, canteens }: { plans: PlanListRow[]; canteens: string[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [canteen, setCanteen] = useState(canteens[0] ?? "");
  const [custom, setCustom] = useState("");
  const [monday, setMonday] = useState(nextMondayISO());
  const [error, setError] = useState<{ text: string; id?: string } | null>(null);

  const chosen = canteen === "__custom" ? custom : canteen;
  const { week, year } = isoWeekOf(monday);

  function create() {
    setError(null);
    startTransition(async () => {
      const res = await createPlan({ canteen: chosen, mondayISO: monday });
      if (res.error) {
        setError({ text: res.error, id: res.id });
        return;
      }
      router.push(`/admin/planerstellung?id=${res.id}`);
    });
  }

  // Nach Woche gruppieren (neueste zuerst, Reihenfolge kommt vom Server)
  const groups: { key: string; title: string; rows: PlanListRow[] }[] = [];
  for (const p of plans) {
    const key = `${p.year}-${p.week}`;
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, title: weekTitle(p.year, p.week), rows: [] };
      groups.push(g);
    }
    g.rows.push(p);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 p-4">
        <h2 className="mb-3 text-sm font-bold text-ink">Neuen Plan anlegen</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-soft">Kantine</label>
            <select value={canteen} onChange={(e) => setCanteen(e.target.value)} className={input}>
              {canteens.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__custom">Andere Kantine …</option>
            </select>
            {canteen === "__custom" && (
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Name der Kantine"
                className={`${input} mt-2`}
                autoFocus
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-soft">
              Woche (Montag) · KW {week}/{year}
            </label>
            <input type="date" value={monday} onChange={(e) => setMonday(e.target.value)} className={input} />
          </div>
          <button
            type="button"
            onClick={create}
            disabled={pending || !chosen.trim()}
            className="rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white shadow-warm disabled:opacity-60"
          >
            {pending ? "Anlegen …" : "Plan anlegen"}
          </button>
        </div>
        {error && (
          <p className="mt-3 rounded-xl bg-gold-400/20 px-4 py-2.5 text-sm font-medium text-ink">
            {error.text}{" "}
            {error.id && (
              <Link href={`/admin/planerstellung?id=${error.id}`} className="font-bold text-brand-700 underline">
                Vorhandenen Plan öffnen
              </Link>
            )}
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-ink">Gespeicherte Pläne</h2>
        {groups.length === 0 ? (
          <p className="rounded-xl border border-dashed border-sand-300 p-6 text-center text-ink-soft">
            Noch keine Pläne. Lege oben den ersten an.
          </p>
        ) : (
          <div className="space-y-5">
            {groups.map((g) => (
              <div key={g.key}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">{g.title}</p>
                <div className="space-y-2">
                  {g.rows.map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/planerstellung?id=${p.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/40"
                    >
                      <div>
                        <p className="font-bold text-ink">Kantine {p.canteen}</p>
                        <p className="text-xs text-ink-soft">
                          zuletzt bearbeitet am{" "}
                          {new Date(p.updatedAt).toLocaleString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {p.exportCount > 0 && ` · ${p.exportCount}× heruntergeladen`}
                        </p>
                      </div>
                      <span className="rounded-full border border-sand-300 px-3 py-1 text-xs font-semibold text-ink">
                        Öffnen
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
