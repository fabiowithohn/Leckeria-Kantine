"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deletePlan,
  duplicatePlan,
  publishPlan,
  savePlan,
} from "@/app/admin/(panel)/admin-plan-actions";
import {
  CATEGORIES,
  DAY_LABELS,
  defaultDateLabel,
  isoWeekOf,
  planFileName,
  sortCodes,
  type Category,
  type PlanData,
  type PlanMenu,
} from "@/lib/meal-plan";
import { ALLERGENS, ADDITIVES } from "@/lib/allergens";
import { MarkIcon } from "@/components/mark-icon";
import { CategoryIcon } from "@/components/category-icon";

export type PlanMeta = {
  id: string;
  canteen: string;
  year: number;
  week: number;
  mondayISO: string;
  exportCount: number;
};

export type DishSuggestion = {
  title: string;
  codes: string[];
  category: Category | null;
  description: string;
};

type SaveStatus = "saved" | "dirty" | "saving" | "error";

const input =
  "w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
const pillBtn =
  "rounded-full px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";

export function PlanEditor({
  meta,
  initial,
  suggestions,
  canteens,
}: {
  meta: PlanMeta;
  initial: PlanData;
  suggestions: DishSuggestion[];
  canteens: string[];
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanData>(initial);
  const [canteen, setCanteen] = useState(meta.canteen);
  const [customCanteen, setCustomCanteen] = useState(canteens.includes(meta.canteen) ? "" : meta.canteen);
  const [mondayISO, setMondayISO] = useState(meta.mondayISO);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [exportCount, setExportCount] = useState(meta.exportCount);
  const [busy, startTransition] = useTransition();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(true);

  const effectiveCanteen = (canteen === "__custom" ? customCanteen : canteen).trim();
  const { year, week } = isoWeekOf(mondayISO);

  /* ---------- Autosave ---------- */
  const latest = useRef({ plan, canteen: effectiveCanteen, mondayISO });
  useEffect(() => {
    latest.current = { plan, canteen: effectiveCanteen, mondayISO };
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveSeq = useRef(0);
  const changeSeq = useRef(0); // zählt Änderungen, um „gespeichert“ sicher zu erkennen

  const flushSave = useCallback(async (): Promise<boolean> => {
    if (timer.current) clearTimeout(timer.current);
    const snap = latest.current;
    const seq = ++saveSeq.current;
    const changesAtStart = changeSeq.current;
    setStatus("saving");
    const res = await savePlan({
      id: meta.id,
      canteen: snap.canteen,
      mondayISO: snap.mondayISO,
      data: snap.plan,
    });
    if (seq !== saveSeq.current) return !res.error; // inzwischen erneut gespeichert
    if (res.error) {
      setStatus("error");
      setError(res.error);
      return false;
    }
    setError(null);
    setStatus(changeSeq.current === changesAtStart ? "saved" : "dirty");
    return true;
  }, [meta.id]);

  const scheduleSave = useCallback(() => {
    changeSeq.current += 1;
    setStatus("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flushSave(), 1200);
  }, [flushSave]);

  // Beim Verlassen mit ungespeicherten Änderungen warnen
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (status !== "saved") e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [status]);

  function updatePlan(fn: (p: PlanData) => PlanData) {
    setPlan((p) => fn(p));
    scheduleSave();
  }

  function updateMenu(d: number, m: number, patch: Partial<PlanMenu>) {
    updatePlan((p) => ({
      ...p,
      days: p.days.map((day, i) =>
        i !== d ? day : { ...day, menus: day.menus.map((menu, j) => (j !== m ? menu : { ...menu, ...patch })) },
      ),
    }));
  }

  function changeMonday(iso: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
    const prev = isoWeekOf(mondayISO);
    const next = isoWeekOf(iso);
    setMondayISO(iso);
    // Standard-Wochenangabe mitziehen, solange sie nicht von Hand geändert wurde
    updatePlan((p) =>
      p.dateLabel === defaultDateLabel(prev.year, prev.week)
        ? { ...p, dateLabel: defaultDateLabel(next.year, next.week) }
        : p,
    );
  }

  function changeCanteen(value: string) {
    setCanteen(value);
    const name = (value === "__custom" ? customCanteen : value).trim();
    updatePlan((p) => ({ ...p, canteen: name }));
  }

  function changeCustomCanteen(value: string) {
    setCustomCanteen(value);
    updatePlan((p) => ({ ...p, canteen: value.trim() }));
  }

  /* ---------- Live-Vorschau ---------- */
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const res = await fetch("/api/plan-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...plan, canteen: effectiveCanteen, kw: week }),
        });
        if (!res.ok) throw new Error(`Vorschau fehlgeschlagen (${res.status})`);
        const blob = await res.blob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        setPreviewUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return url;
        });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [plan, effectiveCanteen, week]);

  /* ---------- Download / Veröffentlichen / Kopieren ---------- */
  async function download(format: "png" | "jpg") {
    setNotice(null);
    if (status !== "saved" && !(await flushSave())) return;
    const next = exportCount + 1;
    setExportCount(next);
    window.location.href = `/api/plan-image?id=${encodeURIComponent(meta.id)}&format=${format}`;
    setNotice(`Download gestartet: ${planFileName({ canteen: effectiveCanteen, year, week }, next, format)}`);
  }

  function publish(target: "asteel-flash" | "grenzebach") {
    const label = target === "asteel-flash" ? "Asteel Flash" : "Grenzebach";
    if (!confirm(`Diesen Plan jetzt als aktuellen Wochenplan bei „${label}“ auf der Website veröffentlichen? Der bisherige Plan dort wird ersetzt.`)) return;
    setNotice(null);
    startTransition(async () => {
      if (status !== "saved" && !(await flushSave())) return;
      const res = await publishPlan({ id: meta.id, target });
      if (res.error) setError(res.error);
      else setNotice(`Plan ist jetzt bei „${label}“ auf der Website veröffentlicht.`);
    });
  }

  const [copyTarget, setCopyTarget] = useState(canteens.find((c) => c !== meta.canteen) ?? "");
  function copyTo() {
    if (!copyTarget) return;
    setNotice(null);
    startTransition(async () => {
      if (status !== "saved" && !(await flushSave())) return;
      const res = await duplicatePlan({ id: meta.id, canteen: copyTarget });
      if (res.error) setError(res.error);
      else router.push(`/admin/planerstellung?id=${res.id}`);
    });
  }

  function remove() {
    if (!confirm(`Plan „${effectiveCanteen}, KW ${week}/${year}“ endgültig löschen?`)) return;
    startTransition(async () => {
      await deletePlan(meta.id);
      router.push("/admin/planerstellung");
    });
  }

  const statusText: Record<SaveStatus, string> = {
    saved: "Alle Änderungen gespeichert",
    dirty: "Änderungen werden gespeichert …",
    saving: "Speichern …",
    error: "Speichern fehlgeschlagen",
  };

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/planerstellung" className="text-sm font-semibold text-brand-700 hover:underline">
            ← Alle Pläne
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-ink">
            Speiseplan {effectiveCanteen || "…"} · KW {week}
          </h1>
          <p className={`mt-1 text-sm ${status === "error" ? "font-semibold text-brand-700" : "text-ink-soft"}`}>
            {statusText[status]}
          </p>
        </div>
      </header>

      {(error || notice) && (
        <p
          className={`mb-4 rounded-xl px-4 py-2.5 text-sm font-medium ${
            error ? "bg-brand-100 text-brand-700" : "bg-herb-500/15 text-herb-600"
          }`}
        >
          {error ?? notice}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_480px]">
        {/* ---------- Eingabe ---------- */}
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-sand-200 bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-soft">Kantine</label>
                <select value={canteen} onChange={(e) => changeCanteen(e.target.value)} className={input}>
                  {canteens.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__custom">Andere Kantine …</option>
                </select>
                {canteen === "__custom" && (
                  <input
                    value={customCanteen}
                    onChange={(e) => changeCustomCanteen(e.target.value)}
                    placeholder="Name der Kantine"
                    className={`${input} mt-2`}
                  />
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-soft">
                  Woche (Montag) · KW {week}/{year}
                </label>
                <input type="date" value={mondayISO} onChange={(e) => changeMonday(e.target.value)} className={input} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-soft">Wochenangabe im Kopf</label>
                <div className="flex gap-2">
                  <input
                    value={plan.dateLabel}
                    onChange={(e) => updatePlan((p) => ({ ...p, dateLabel: e.target.value }))}
                    className={input}
                  />
                  <button
                    type="button"
                    title="Standard wiederherstellen"
                    onClick={() => updatePlan((p) => ({ ...p, dateLabel: defaultDateLabel(year, week) }))}
                    className="shrink-0 rounded-lg border border-sand-300 px-2.5 text-xs font-semibold text-ink-soft hover:bg-sand-100"
                  >
                    Standard
                  </button>
                </div>
              </div>
            </div>
          </section>

          {plan.days.map((day, d) => (
            <section key={d} className="rounded-2xl border border-sand-200 bg-white p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-bold text-ink">{DAY_LABELS[d]}</h2>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={day.closed}
                    onChange={(e) =>
                      updatePlan((p) => ({
                        ...p,
                        days: p.days.map((x, i) => (i === d ? { ...x, closed: e.target.checked } : x)),
                      }))
                    }
                    className="h-4 w-4 accent-brand-500"
                  />
                  Kantine geschlossen
                </label>
              </div>
              {day.closed ? (
                <p className="rounded-xl border border-dashed border-sand-300 p-4 text-center text-sm text-ink-soft">
                  Auf dem Plan steht „geschlossen“ in allen drei Spalten.
                </p>
              ) : (
                <div className="grid gap-3 lg:grid-cols-3">
                  {day.menus.map((menu, m) => (
                    <MenuCard
                      key={m}
                      index={m}
                      menu={menu}
                      suggestions={suggestions}
                      onChange={(patch) => updateMenu(d, m, patch)}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}

          <section className="rounded-2xl border border-sand-200 bg-white p-4">
            <h2 className="mb-3 text-base font-bold text-ink">Fußzeile</h2>
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink-soft">Salate · fett</label>
                  <input
                    value={plan.saladTitle}
                    onChange={(e) => updatePlan((p) => ({ ...p, saladTitle: e.target.value }))}
                    className={input}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-ink-soft">Salate · Text</label>
                  <input
                    value={plan.saladText}
                    onChange={(e) => updatePlan((p) => ({ ...p, saladText: e.target.value }))}
                    className={input}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-soft">Hinweis rechts unten (leer = ausblenden)</label>
                <textarea
                  value={plan.note}
                  onChange={(e) => updatePlan((p) => ({ ...p, note: e.target.value }))}
                  rows={2}
                  className={input}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={plan.showLegend}
                  onChange={(e) => updatePlan((p) => ({ ...p, showLegend: e.target.checked }))}
                  className="h-4 w-4 accent-brand-500"
                />
                Legende (mit Rind, mit Huhn, …) rechts anzeigen
              </label>
            </div>
          </section>
        </div>

        {/* ---------- Vorschau & Aktionen ---------- */}
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-2xl border border-sand-200 bg-white p-3">
            <div className="relative overflow-hidden rounded-xl bg-sand-100" style={{ aspectRatio: "1600 / 1131" }}>
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Vorschau des Speiseplans" className="block h-full w-full object-contain" />
              )}
              {previewLoading && (
                <div className="absolute inset-0 grid place-items-center bg-white/50 text-sm font-semibold text-ink-soft backdrop-blur-[1px]">
                  Vorschau wird erstellt …
                </div>
              )}
            </div>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs font-semibold text-brand-700 hover:underline"
              >
                Vorschau in voller Größe öffnen ↗
              </a>
            )}
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-sand-200 bg-white p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Herunterladen</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => download("png")} disabled={busy} className={`${pillBtn} bg-brand-500 text-white shadow-warm hover:bg-brand-600`}>
                  Als PNG
                </button>
                <button type="button" onClick={() => download("jpg")} disabled={busy} className={`${pillBtn} bg-brand-500 text-white shadow-warm hover:bg-brand-600`}>
                  Als JPG
                </button>
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                Nächste Datei: {planFileName({ canteen: effectiveCanteen, year, week }, exportCount + 1, "png")} · 3200 × 2262 px
              </p>
            </div>

            <div className="rounded-2xl border border-sand-200 bg-white p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Auf der Website veröffentlichen</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => publish("asteel-flash")} disabled={busy} className={`${pillBtn} border border-brand-200 text-brand-700 hover:bg-brand-50`}>
                  Bei Asteel Flash
                </button>
                <button type="button" onClick={() => publish("grenzebach")} disabled={busy} className={`${pillBtn} border border-brand-200 text-brand-700 hover:bg-brand-50`}>
                  Bei Grenzebach
                </button>
              </div>
              <p className="mt-2 text-xs text-ink-soft">Ersetzt den dort aktuell gezeigten Wochenplan sofort.</p>
            </div>

            <div className="rounded-2xl border border-sand-200 bg-white p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Für andere Kantine kopieren</p>
              <div className="flex gap-2">
                <select value={copyTarget} onChange={(e) => setCopyTarget(e.target.value)} className={input}>
                  {canteens.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={copyTo} disabled={busy || !copyTarget} className={`${pillBtn} shrink-0 border border-sand-300 text-ink hover:bg-sand-100`}>
                  Kopieren
                </button>
              </div>
              <p className="mt-2 text-xs text-ink-soft">Legt einen neuen Plan derselben Woche mit allen Gerichten an.</p>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={remove} disabled={busy} className={`${pillBtn} border border-brand-200 text-xs text-brand-700 hover:bg-brand-50`}>
                Plan löschen
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------------- Ein Menü-Feld ---------------- */
function MenuCard({
  index,
  menu,
  suggestions,
  onChange,
}: {
  index: number;
  menu: PlanMenu;
  suggestions: DishSuggestion[];
  onChange: (patch: Partial<PlanMenu>) => void;
}) {
  const [focused, setFocused] = useState(false);
  const hasAdditive = ADDITIVES.some((a) => menu.codes.includes(a.code));
  const [showAdditives, setShowAdditives] = useState(hasAdditive);
  const q = menu.title.trim().toLowerCase();
  const matches =
    focused && q.length >= 2
      ? suggestions.filter((s) => s.title.toLowerCase().includes(q) && s.title.toLowerCase() !== q).slice(0, 6)
      : [];

  function toggleCode(code: string) {
    const set = new Set(menu.codes);
    if (set.has(code)) set.delete(code);
    else set.add(code);
    onChange({ codes: sortCodes([...set]) });
  }

  return (
    <div className="rounded-xl border border-sand-200 bg-sand-50/60 p-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Menü {index + 1}</p>

      <div className="relative">
        <input
          value={menu.title}
          onChange={(e) => onChange({ title: e.target.value })}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Gericht, z. B. Köttbullar"
          className={`${input} font-bold`}
          autoComplete="off"
        />
        {matches.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-sand-200 bg-white shadow-warm">
            {matches.map((s) => (
              <li key={s.title}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange({ title: s.title, codes: s.codes, category: s.category, description: s.description });
                    setFocused(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-brand-50"
                >
                  <span className="min-w-0">
                    <span className="font-bold text-ink">{s.title}</span>
                    {s.description && <span className="block truncate text-xs text-ink-soft">{s.description.replace(/\n/g, " · ")}</span>}
                  </span>
                  <span className="shrink-0 text-xs text-ink-soft">{s.codes.length > 0 && `*${s.codes.join(",")}`}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-2">
        <p className="mb-1 text-[11px] font-semibold text-ink-soft">
          Kennzeichnung zum Gericht{menu.codes.length > 0 && <span className="ml-1 font-bold text-ink">*{sortCodes(menu.codes).join(",")}</span>}
        </p>
        <div className="flex flex-wrap gap-1">
          {ALLERGENS.map((a) => (
            <CodeChip key={a.nr} code={a.nr} title={`${a.nr} – ${a.name}`} iconPath={a.iconPath} active={menu.codes.includes(a.nr)} onClick={() => toggleCode(a.nr)} />
          ))}
        </div>
        {showAdditives || hasAdditive ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {ADDITIVES.map((a) => (
              <CodeChip key={a.code} code={a.code} title={`${a.code}) ${a.category}`} iconPath={a.iconPath} active={menu.codes.includes(a.code)} onClick={() => toggleCode(a.code)} />
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAdditives(true)}
            className="mt-1 text-[11px] font-semibold text-brand-700 hover:underline"
          >
            + Zusatzstoffe a–m
          </button>
        )}
      </div>

      <div className="mt-2">
        <p className="mb-1 text-[11px] font-semibold text-ink-soft">Symbol</p>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => onChange({ category: null })}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
              menu.category === null ? "border-brand-300 bg-brand-50 text-brand-700" : "border-sand-200 bg-white text-ink-soft hover:bg-sand-100"
            }`}
          >
            keins
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              title={c.label}
              aria-pressed={menu.category === c.key}
              onClick={() => onChange({ category: c.key })}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                menu.category === c.key ? "border-brand-300 bg-brand-50 text-brand-700" : "border-sand-200 bg-white text-ink hover:bg-sand-100"
              }`}
            >
              <CategoryIcon category={c.key} className="h-4 w-4" />
              {c.label.replace("mit ", "")}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2">
        <textarea
          value={menu.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          placeholder={"Beschreibung, z. B.\nmit Kroketten *1\nDazu Reis"}
          className={input}
        />
        <p className="mt-1 text-[11px] text-ink-soft">Jede Zeile wird eine Zeile auf dem Plan. „*7,9“ im Text wird klein hochgestellt.</p>
      </div>
    </div>
  );
}

function CodeChip({
  code,
  title,
  iconPath,
  active,
  onClick,
}: {
  code: string;
  title: string;
  iconPath: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-7 items-center gap-1 rounded-full border px-2 text-xs font-semibold transition ${
        active ? "border-brand-300 bg-brand-50 text-brand-700" : "border-sand-200 bg-white text-ink-soft hover:bg-sand-100"
      }`}
    >
      <MarkIcon path={iconPath} className="h-3.5 w-3.5" />
      {code}
    </button>
  );
}
