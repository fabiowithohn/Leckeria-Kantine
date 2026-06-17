import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { weekdays, isoFromDate, dbDateFromISO, type WeekdayCode } from "@/lib/time";
import { Container } from "@/components/ui";
import { BookingDashboard, type DishDTO } from "@/components/booking-dashboard";
import { logoutEmployee } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bestellbereich – Grenzebach" };

type DishLike = {
  id: string;
  title: string;
  description: string | null;
  allergens: string[];
  additives: string[];
  updatedAt: Date;
};

function serialize(d: DishLike, withImage: Set<string>): DishDTO {
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    allergens: d.allergens,
    additives: d.additives,
    hasImage: withImage.has(d.id),
    imageVersion: d.updatedAt.getTime().toString(),
  };
}

export default async function GrenzebachPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/grenzebach/login");

  // Aktive Zuordnungen inkl. Bibliotheks-Gericht (ohne Bilddaten) laden.
  const [assignments, imaged] = await Promise.all([
    prisma.menuAssignment.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        slot: true,
        dish: {
          select: { id: true, title: true, description: true, allergens: true, additives: true, updatedAt: true },
        },
      },
    }),
    prisma.dish.findMany({
      where: { NOT: { imageData: null } },
      select: { id: true },
    }),
  ]);
  const withImage = new Set(imaged.map((d) => d.id));

  const dailyFixed: DishDTO[] = [];
  const byWeekday: Record<WeekdayCode, DishDTO[]> = {
    MON: [],
    TUE: [],
    WED: [],
    THU: [],
    FRI: [],
  };
  for (const a of assignments) {
    const dto = serialize(a.dish, withImage);
    if (a.slot === "DAILY_FIXED") dailyFixed.push(dto);
    else byWeekday[a.slot as WeekdayCode].push(dto);
  }

  const weeks = [
    { offset: 0 as const, label: "Diese Woche", days: weekdays(0) },
    { offset: 1 as const, label: "Nächste Woche", days: weekdays(1) },
  ];
  const allDates = weeks.flatMap((w) => w.days.map((d) => d.iso));

  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
      date: { in: allDates.map(dbDateFromISO) },
    },
  });
  const bookingMap: Record<string, { dishId: string; title: string }> = {};
  for (const b of bookings) {
    bookingMap[isoFromDate(b.date)] = { dishId: b.dishId, title: b.dishTitleSnapshot };
  }

  return (
    <div className="bg-dots py-10">
      <Container>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
              Kantine Grenzebach
            </p>
            <h1 className="text-3xl font-black text-ink">
              Hallo {session.user.name}, was darf&apos;s sein?
            </h1>
            <p className="mt-1 text-ink-soft">
              Bestellschluss ist täglich um <strong>09:30 Uhr</strong>. Du kannst
              bis zu eine Woche im Voraus buchen.
            </p>
          </div>
          <form action={logoutEmployee}>
            <button
              type="submit"
              className="rounded-full border border-sand-300 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-sand-100"
            >
              Abmelden
            </button>
          </form>
        </div>

        <BookingDashboard
          dailyFixed={dailyFixed}
          byWeekday={byWeekday}
          weeks={weeks}
          bookings={bookingMap}
        />
      </Container>
    </div>
  );
}
