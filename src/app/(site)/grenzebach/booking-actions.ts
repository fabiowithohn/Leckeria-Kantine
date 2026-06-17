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

export async function bookDish(
  dishId: string,
  dateISO: string,
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

  // Genau 1 Bestellung pro Tag → upsert ersetzt eine bestehende Auswahl
  await prisma.booking.upsert({
    where: { userId_date: { userId: session.user.id, date: dbDateFromISO(dateISO) } },
    update: { dishId: dish.id, dishTitleSnapshot: dish.title },
    create: {
      userId: session.user.id,
      date: dbDateFromISO(dateISO),
      dishId: dish.id,
      dishTitleSnapshot: dish.title,
    },
  });

  revalidatePath("/grenzebach");
  return { ok: true };
}

export async function cancelBooking(dateISO: string): Promise<BookingResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Bitte zuerst einloggen." };

  if (!ISO_RE.test(dateISO)) return { error: "Ungültiges Datum." };
  if (!isBeforeDeadline(dateISO)) {
    return { error: "Stornieren ist nach Bestellschluss (09:30 Uhr) nicht mehr möglich." };
  }

  await prisma.booking
    .delete({
      where: { userId_date: { userId: session.user.id, date: dbDateFromISO(dateISO) } },
    })
    .catch(() => {});

  revalidatePath("/grenzebach");
  return { ok: true };
}
