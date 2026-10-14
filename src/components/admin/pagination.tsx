"use client";

import { useState } from "react";

/** Einträge pro Seite in den langen Admin-Listen (Mitarbeitende, Bibliothek). */
export const PAGE_SIZE = 30;

/**
 * Hält die aktuelle Seite. Ändert sich `resetKey` (z. B. der Suchbegriff),
 * springt die Liste auf Seite 1. Schrumpft die Liste (Löschen, Filter), wird
 * die Seite auf die letzte vorhandene begrenzt.
 */
export function usePagination<T>(items: T[], opts: { resetKey?: string; pageSize?: number } = {}) {
  const pageSize = opts.pageSize ?? PAGE_SIZE;
  const resetKey = opts.resetKey ?? "";
  const [page, setPage] = useState(1);
  const [lastKey, setLastKey] = useState(resetKey);

  // Zustand während des Renderns anpassen (React-Muster für abgeleitete Resets)
  if (resetKey !== lastKey) {
    setLastKey(resetKey);
    setPage(1);
  }

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return {
    page: safePage,
    pageCount,
    setPage,
    pageItems,
    /** 1-basierte Positionen des ersten/letzten Eintrags auf dieser Seite */
    from: items.length === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, items.length),
    total: items.length,
  };
}

/** Kurze Positionsangabe über der Liste, z. B. „1–30 von 226 Konten“. */
export function PageRange({
  from,
  to,
  total,
  noun,
}: {
  from: number;
  to: number;
  total: number;
  noun: string;
}) {
  if (total === 0) return null;
  const all = from === 1 && to === total;
  return (
    <p className="text-sm text-ink-soft">
      {all ? (
        <>
          {total} {noun}
        </>
      ) : (
        <>
          <span className="font-semibold text-ink tabular-nums">
            {from}–{to}
          </span>{" "}
          von {total} {noun}
        </>
      )}
    </p>
  );
}

/** Welche Seitenzahlen gezeigt werden: alle bei wenigen Seiten, sonst Fenster um die aktuelle. */
function pageWindow(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("…");
    out.push(sorted[i]);
  }
  return out;
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d={dir === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const pill =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 disabled:cursor-not-allowed disabled:opacity-40";
const pillIdle = "border-sand-300 bg-white text-ink hover:bg-sand-100 disabled:hover:bg-white";
const pillActive = "border-brand-500 bg-brand-500 text-white shadow-warm";

/**
 * Seitennavigation unterhalb einer Liste: links der Stand („Seite 2 von 8 ·
 * 226 Konten insgesamt“), rechts die kompakte Gruppe aus Zurück, Seitenzahlen
 * und Weiter. Rendert nichts, wenn alles auf eine Seite passt.
 */
export function Pagination({
  page,
  pageCount,
  onChange,
  total,
  noun,
  label = "Seitennavigation",
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  /** Gesamtzahl der Einträge für den Status links */
  total: number;
  /** Nominativ Plural, z. B. „Konten“ oder „Gerichte“ */
  noun: string;
  label?: string;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav
      aria-label={label}
      className="mt-6 flex flex-col gap-3 border-t border-sand-200 pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-ink-soft">
        Seite <span className="font-semibold text-ink tabular-nums">{page}</span> von{" "}
        <span className="tabular-nums">{pageCount}</span>
        <span className="mx-1.5 text-ink-soft" aria-hidden="true">
          ·
        </span>
        <span className="tabular-nums">{total}</span> {noun} insgesamt
      </p>

      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <button
            type="button"
            onClick={() => onChange(page - 1)}
            disabled={page === 1}
            className={`${pill} ${pillIdle} gap-1.5`}
          >
            <Chevron dir="left" />
            Zurück
          </button>
        </li>
        {pageWindow(page, pageCount).map((p, i) =>
          p === "…" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="grid h-9 w-7 place-items-center text-sm text-ink-soft">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Seite ${p}`}
                className={`${pill} tabular-nums ${p === page ? pillActive : pillIdle}`}
              >
                {p}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            onClick={() => onChange(page + 1)}
            disabled={page === pageCount}
            className={`${pill} ${pillIdle} gap-1.5`}
          >
            Weiter
            <Chevron dir="right" />
          </button>
        </li>
      </ol>
    </nav>
  );
}
