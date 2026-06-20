"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  isBeforeDeadline,
  weekdays,
  weekdayCodeFromISO,
  dbDateFromISO,
} from "@/lib/time";

export type BookingResult = { ok?: boolean; error?: string };

/** Erlaubte Buchungstage: Werktage dieser & nächster Woche, noch vor Bestellschluss. */
function allowedDates(): Set<string> {
  const days = [...weekdays(0), ...weekdays(1)];
  return new Set(days.filter((d) => !d.isPast && d.bookable).map((d) => d.iso));
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PORTIONS = 20;

/**
 * Setzt die Bestellung für EIN Gericht an einem Tag: legt genau `notes.length`
 * Portionen an (eine Zeile pro Portion, mit eigenem Sonderwunsch). Eine
 * bestehende Auswahl dieses Gerichts an diesem Tag wird ersetzt. Anzahl 0 =
 * Gericht für diesen Tag abbestellen.
 */
export async function setDishOrder(
  dishId: string,
  dateISO: string,
  notes: string[],
): Promise<BookingResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Bitte zuerst einloggen." };

  if (!ISO_RE.test(dateISO)) return { error: "Ungültiges Datum." };
  if (!allowedDates().has(dateISO)) {
    return { error: "Für diesen Tag kann nicht (mehr) bestellt werden." };
  }
  if (!isBeforeDeadline(dateISO)) {
    return { error: "Der Bestellschluss (09:30 Uhr) für diesen Tag ist vorbei." };
  }

  const dish = await prisma.dish.findUnique({ where: { id: dishId } });
  if (!dish) return { error: "Dieses Gericht ist nicht verfügbar." };

  // Das Gericht muss für diesen Tag aktiv zugeordnet sein
  // (Wochentag-Slot ODER "Tägliche Speisen").
  const wd = weekdayCodeFromISO(dateISO);
  if (!wd) return { error: "An diesem Tag ist keine Bestellung möglich." };
  const assignment = await prisma.menuAssignment.findFirst({
    where: { dishId: dish.id, active: true, slot: { in: [wd, "DAILY_FIXED"] } },
  });
  if (!assignment) {
    return { error: "Dieses Gericht ist an diesem Tag nicht verfügbar." };
  }

  const list = Array.isArray(notes) ? notes.slice(0, MAX_PORTIONS) : [];
  const date = dbDateFromISO(dateISO);
  const rows = list.map((n) => ({
    userId: session.user!.id,
    date,
    dishId: dish.id,
    dishTitleSnapshot: dish.title,
    // Sonderwunsch nur, wenn das Gericht es erlaubt
    note: dish.allowNote && typeof n === "string" ? n.trim().slice(0, 300) || null : null,
  }));

  // Bestehende Portionen dieses Gerichts ersetzen (alte löschen, neue anlegen)
  await prisma.$transaction([
    prisma.booking.deleteMany({ where: { userId: session.user.id, dishId: dish.id, date } }),
    ...(rows.length ? [prisma.booking.createMany({ data: rows })] : []),
  ]);

  revalidatePath("/grenzebach");
  return { ok: true };
}
