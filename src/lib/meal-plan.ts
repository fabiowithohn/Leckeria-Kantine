// Datenmodell und Helfer der Planerstellung (Speisepläne zum Ausdrucken /
// Hochladen). Der eigentliche Inhalt eines Plans liegt als JSON in
// MealPlan.data – Struktur siehe PlanData.

export const CANTEENS = ["Asteel Flash", "Grenzebach", "LIBRI"] as const;

/** Kategorie-Symbol neben dem Gerichtnamen (Legende rechts auf dem Plan). */
export type Category = "rind" | "huhn" | "schwein" | "fisch" | "veg";

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: "rind", label: "mit Rind" },
  { key: "huhn", label: "mit Huhn" },
  { key: "schwein", label: "mit Schwein" },
  { key: "fisch", label: "mit Fisch" },
  { key: "veg", label: "Vegetarisch" },
];

export type PlanMenu = {
  title: string;
  /** Allergene (1–14) und Zusatzstoffe (a–m), erscheinen als „*1,3,7“ hinter dem Titel */
  codes: string[];
  category: Category | null;
  /** Beschreibung, mehrzeilig. „*7,9“ im Text wird als Kennzeichnung gesetzt. */
  description: string;
};

export type PlanDay = {
  closed: boolean;
  menus: PlanMenu[]; // immer 3 (Menü 1–3)
};

export type PlanData = {
  canteen: string;
  /** Wochenangabe im Kopf, z. B. „vom 12.10. – 16.10.26“ */
  dateLabel: string;
  days: PlanDay[]; // Montag–Freitag
  saladTitle: string;
  saladText: string;
  note: string;
  showLegend: boolean;
};

export const DAY_LABELS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
export const MENU_COUNT = 3;

export const DEFAULT_SALAD_TITLE = "Gemischter Salatteller:";
export const DEFAULT_SALAD_TEXT =
  "wahlweise mit Balkankäse und Oliven, gebratenen Hähnchenstreifen oder Thunfisch";
export const DEFAULT_NOTE =
  "Unseren Salat & unsere vegetarischen Alternativen gibt es täglich nach Vorbestellung bis 10 Uhr.";

export function emptyMenu(): PlanMenu {
  return { title: "", codes: [], category: null, description: "" };
}

export function emptyPlan(canteen: string, year: number, week: number): PlanData {
  return {
    canteen,
    dateLabel: defaultDateLabel(year, week),
    days: DAY_LABELS.map(() => ({
      closed: false,
      menus: Array.from({ length: MENU_COUNT }, emptyMenu),
    })),
    saladTitle: DEFAULT_SALAD_TITLE,
    saladText: DEFAULT_SALAD_TEXT,
    note: DEFAULT_NOTE,
    showLegend: true,
  };
}

/** Bringt beliebiges JSON (z. B. aus der DB) in eine vollständige PlanData-Struktur. */
export function normalizePlan(raw: unknown, fallback: PlanData): PlanData {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<PlanData>;
  const str = (v: unknown, d: string) => (typeof v === "string" ? v : d);
  const days = Array.isArray(r.days) ? r.days : [];
  return {
    canteen: str(r.canteen, fallback.canteen),
    dateLabel: str(r.dateLabel, fallback.dateLabel),
    days: fallback.days.map((fd, i) => {
      const d = (days[i] ?? {}) as Partial<PlanDay>;
      const menus = Array.isArray(d.menus) ? d.menus : [];
      return {
        closed: d.closed === true,
        menus: fd.menus.map((_, j) => {
          const m = (menus[j] ?? {}) as Partial<PlanMenu>;
          const cat = m.category;
          return {
            title: str(m.title, ""),
            codes: Array.isArray(m.codes) ? m.codes.filter((c): c is string => typeof c === "string") : [],
            category: CATEGORIES.some((c) => c.key === cat) ? (cat as Category) : null,
            description: str(m.description, ""),
          };
        }),
      };
    }),
    saladTitle: str(r.saladTitle, fallback.saladTitle),
    saladText: str(r.saladText, fallback.saladText),
    note: str(r.note, fallback.note),
    showLegend: r.showLegend !== false,
  };
}

/* ---------------- Kalenderwoche ---------------- */

/** Montag (UTC-Datum) einer ISO-Kalenderwoche. */
export function isoWeekMonday(year: number, week: number): Date {
  // 4. Januar liegt immer in KW 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7; // Mo=1 … So=7
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const monday = new Date(mondayWeek1);
  monday.setUTCDate(mondayWeek1.getUTCDate() + (week - 1) * 7);
  return monday;
}

/** ISO-Jahr und -Kalenderwoche zu einem Datum (als "YYYY-MM-DD"). */
export function isoWeekOf(iso: string): { year: number; week: number } {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDay() || 7;
  // auf den Donnerstag derselben Woche schieben
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const year = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year, week };
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Heutiges Datum (Berlin) als "YYYY-MM-DD". */
export function todayISO(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date());
}

/** Zahl der Kalenderwochen eines ISO-Jahres (52 oder 53). */
export function weeksInYear(year: number): number {
  const dec28 = toISODate(new Date(Date.UTC(year, 11, 28)));
  return isoWeekOf(dec28).week;
}

function ddmm(date: Date): string {
  return `${String(date.getUTCDate()).padStart(2, "0")}.${String(date.getUTCMonth() + 1).padStart(2, "0")}.`;
}

/** Standard-Wochenangabe wie auf den bisherigen Plänen: „vom 12.10. – 16.10.26“ */
export function defaultDateLabel(year: number, week: number): string {
  const mon = isoWeekMonday(year, week);
  const fri = new Date(mon);
  fri.setUTCDate(mon.getUTCDate() + 4);
  return `vom ${ddmm(mon)} – ${ddmm(fri)}${String(fri.getUTCFullYear()).slice(-2)}`;
}

/** Kurzer Wochentitel für Listen: „KW 42 · 12.10. – 16.10.2026“ */
export function weekTitle(year: number, week: number): string {
  const mon = isoWeekMonday(year, week);
  const fri = new Date(mon);
  fri.setUTCDate(mon.getUTCDate() + 4);
  return `KW ${week} · ${ddmm(mon)} – ${ddmm(fri)}${fri.getUTCFullYear()}`;
}

/* ---------------- Dateiname ---------------- */

/** „Speiseplan_KW42_2026_Asteel-Flash_v3.png“ – die Nummer zählt pro Plan und Download hoch. */
export function planFileName(
  plan: { canteen: string; year: number; week: number },
  version: number,
  ext: "png" | "jpg",
): string {
  const canteen = plan.canteen
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `Speiseplan_KW${String(plan.week).padStart(2, "0")}_${plan.year}_${canteen || "Kantine"}_v${version}.${ext}`;
}

/* ---------------- Kennzeichnungen im Text ---------------- */

const CODE_ORDER = [
  ...Array.from({ length: 14 }, (_, i) => String(i + 1)),
  ..."abcdefghijklm".split(""),
];

/** Sortiert Kennzeichnungen wie auf den Plänen: erst Zahlen 1–14, dann a–m. */
export function sortCodes(codes: string[]): string[] {
  const set = new Set(codes);
  return CODE_ORDER.filter((c) => set.has(c));
}

export type TextPart = { kind: "text"; value: string } | { kind: "codes"; value: string };

/**
 * Zerlegt eine Beschreibungszeile in Text und Kennzeichnungen:
 * „mit Rosinen und Mandeln *8“ → [text „mit Rosinen und Mandeln “, codes „*8“].
 * Erkannt wird „*“ gefolgt von Nummern/Buchstaben, durch Kommas getrennt.
 */
export function splitCodes(line: string): TextPart[] {
  const parts: TextPart[] = [];
  const re = /\*((?:1[0-4]|[1-9]|[a-m])(?:,(?:1[0-4]|[1-9]|[a-m]))*)/g;
  let last = 0;
  for (const m of line.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) parts.push({ kind: "text", value: line.slice(last, i) });
    parts.push({ kind: "codes", value: `*${m[1]}` });
    last = i + m[0].length;
  }
  if (last < line.length) parts.push({ kind: "text", value: line.slice(last) });
  return parts;
}

/** Normalisierter Schlüssel für den Gerichte-Merker. */
export function dishKey(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

/* ---------------- Gerichte zwischen Tagen und Plänen ---------------- */

/** Vertauscht zwei Tage komplett (Menüs und „geschlossen“). */
export function swapDays(plan: PlanData, a: number, b: number): PlanData {
  if (a === b || a < 0 || b < 0 || a >= plan.days.length || b >= plan.days.length) return plan;
  const days = plan.days.slice();
  [days[a], days[b]] = [days[b], days[a]];
  return { ...plan, days };
}

/** Vertauscht ein einzelnes Menü-Feld mit dem gleichen Feld eines anderen Tages. */
export function swapMenu(plan: PlanData, dayA: number, dayB: number, menu: number): PlanData {
  if (dayA === dayB || dayA < 0 || dayB < 0 || dayA >= plan.days.length || dayB >= plan.days.length) return plan;
  const days = plan.days.map((d) => ({ ...d, menus: d.menus.slice() }));
  const tmp = days[dayA].menus[menu];
  days[dayA].menus[menu] = days[dayB].menus[menu];
  days[dayB].menus[menu] = tmp;
  return { ...plan, days };
}

/**
 * Übernimmt die Gerichte eines anderen Plans, optional um `shift` Tage verschoben
 * (+1 = Montag des Quellplans landet auf Dienstag). Mit `overwrite` werden belegte
 * Felder ersetzt, sonst nur leere gefüllt. Tage ohne Quelle bleiben unverändert.
 */
export function importDays(target: PlanData, source: PlanData, shift: number, overwrite: boolean): PlanData {
  const days = target.days.map((d) => ({ ...d, menus: d.menus.map((m) => ({ ...m, codes: m.codes.slice() })) }));
  for (let i = 0; i < source.days.length; i++) {
    const j = i + shift;
    if (j < 0 || j >= days.length) continue;
    const src = source.days[i];
    if (src.closed) continue;
    for (let m = 0; m < days[j].menus.length; m++) {
      const from = src.menus[m];
      if (!from || !from.title.trim()) continue;
      if (!overwrite && days[j].menus[m].title.trim()) continue;
      days[j].menus[m] = { ...from, codes: from.codes.slice() };
    }
  }
  return { ...target, days };
}
