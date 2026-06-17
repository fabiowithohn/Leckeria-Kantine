import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { de } from "date-fns/locale";

export const TZ = "Europe/Berlin";
export const ORDER_DEADLINE = "09:30"; // Bestellschluss am Bestelltag

export type WeekdayCode = "MON" | "TUE" | "WED" | "THU" | "FRI";

export const WEEKDAYS: WeekdayCode[] = ["MON", "TUE", "WED", "THU", "FRI"];

export const WEEKDAY_LABEL: Record<WeekdayCode, string> = {
  MON: "Montag",
  TUE: "Dienstag",
  WED: "Mittwoch",
  THU: "Donnerstag",
  FRI: "Freitag",
};

const DAY_TO_CODE: Record<number, WeekdayCode | undefined> = {
  1: "MON",
  2: "TUE",
  3: "WED",
  4: "THU",
  5: "FRI",
};

/** Heutiges Datum in Europe/Berlin als 'yyyy-MM-dd'. */
export function todayBerlinISO(): string {
  return formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
}

/** Stabiles Date-Objekt für einen Kalendertag (UTC-Mittag, DST-sicher). */
export function dateFromISO(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

/** 'yyyy-MM-dd' aus einem (in der DB als @db.Date gespeicherten) Date. */
export function isoFromDate(date: Date): string {
  return formatInTimeZone(date, "UTC", "yyyy-MM-dd");
}

/** Date-Objekt zum Speichern in einer @db.Date-Spalte (UTC-Mitternacht). */
export function dbDateFromISO(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function weekdayCodeFromISO(iso: string): WeekdayCode | null {
  return DAY_TO_CODE[dateFromISO(iso).getUTCDay()] ?? null;
}

function addDaysISO(iso: string, days: number): string {
  const d = dateFromISO(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return formatInTimeZone(d, "UTC", "yyyy-MM-dd");
}

/** Montag der Woche, die `iso` enthält. */
function mondayOfWeekISO(iso: string): string {
  const day = dateFromISO(iso).getUTCDay(); // 0=So..6=Sa
  const diff = day === 0 ? -6 : 1 - day; // zurück bis Montag
  return addDaysISO(iso, diff);
}

export interface DayInfo {
  iso: string;
  weekday: WeekdayCode;
  label: string;
  dayLabel: string; // z.B. "Mo, 02.06."
  isPast: boolean;
  bookable: boolean; // vor Bestellschluss?
}

/** Die fünf Werktage (Mo–Fr) einer Woche relativ zur aktuellen Woche. */
export function weekdays(weekOffset: 0 | 1): DayInfo[] {
  const today = todayBerlinISO();
  const monday = addDaysISO(mondayOfWeekISO(today), weekOffset * 7);
  return WEEKDAYS.map((wd, i) => {
    const iso = addDaysISO(monday, i);
    return {
      iso,
      weekday: wd,
      label: WEEKDAY_LABEL[wd],
      dayLabel: formatInTimeZone(dateFromISO(iso), TZ, "EEEEEE, dd.MM.", {
        locale: de,
      }),
      isPast: iso < today,
      bookable: isBeforeDeadline(iso),
    };
  });
}

/** Bestellschluss-Instant (UTC) für einen Kalendertag: 09:30 Berlin. */
export function deadlineInstant(iso: string): Date {
  return fromZonedTime(`${iso}T${ORDER_DEADLINE}:00`, TZ);
}

/** Darf für `iso` jetzt noch bestellt/geändert/storniert werden? */
export function isBeforeDeadline(iso: string): boolean {
  return Date.now() < deadlineInstant(iso).getTime();
}

/** Menschliche Datums-Ausgabe, z.B. "Montag, 02.06.2026". */
export function formatGermanDate(iso: string): string {
  return formatInTimeZone(dateFromISO(iso), TZ, "EEEE, dd.MM.yyyy", {
    locale: de,
  });
}
