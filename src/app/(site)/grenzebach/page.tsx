import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { weekdays, isoFromDate, dbDateFromISO, type WeekdayCode } from "@/lib/time";
import { Container } from "@/components/ui";
import { BookingDashboard, type DishDTO } from "@/components/booking-dashboard";
import { getGrenzebachPlanMeta } from "@/lib/weekly-plan";
import { logoutEmployee } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bestellbereich – Grenzebach" };

type DishLike = {
  id: string;
  title: string;
  description: string | null;
  allergens: string[];
  additives: string[];
  allowNote: boolean;
  updatedAt: Date;
};

function serialize(d: DishLike, withImage: Set<string>): DishDTO {
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    allergens: d.allergens,
    additives: d.additives,
    allowNote: d.allowNote,
    hasImage: withImage.has(d.id),
    imageVersion: d.updatedAt.getTime().toString(),
  };
}

export default async function GrenzebachPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/grenzebach/login");

  const planMeta = await getGrenzebachPlanMeta();

  // Aktive Zuordnungen inkl. Bibliotheks-Gericht (ohne Bilddaten) laden.
  const [assignments, imaged] = await Promise.all([
    prisma.menuAssignment.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        slot: true,
        dish: {
          select: { id: true, title: true, description: true, allergens: true, additives: true, allowNote: true, updatedAt: true },
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
  ];
  const allDates = weeks.flatMap((w) => w.days.map((d) => d.iso));

  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
      date: { in: allDates.map(dbDateFromISO) },
    },
  });
  const bookingMap: Record<string, { dishId: string; title: string; note: string | null }> = {};
  for (const b of bookings) {
    bookingMap[isoFromDate(b.date)] = { dishId: b.dishId, title: b.dishTitleSnapshot, note: b.note };
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
              für die aktuelle Woche bestellen.
            </p>
            {planMeta?.hasFile && (
              <a
                href={`/api/grenzebach-plan?v=${encodeURIComponent(planMeta.version)}`}
                download="Wochenplan-Grenzebach.jpg"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-extrabold text-white shadow-warm transition hover:bg-brand-600"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                </svg>
                Wochenplan herunterladen
              </a>
            )}
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
