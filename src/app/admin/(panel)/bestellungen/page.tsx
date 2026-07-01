import Link from "next/link";
import { prisma } from "@/lib/db";
import { dbDateFromISO, todayBerlinISO, formatGermanDate, weekdays } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bestellungen – Verwaltung" };

export default async function AdminBestellungenPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const selected = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : todayBerlinISO();

  const bookings = await prisma.booking.findMany({
    where: { date: dbDateFromISO(selected) },
    include: { user: true, dish: { select: { description: true } } },
    orderBy: [{ dishTitleSnapshot: "asc" }, { user: { name: "asc" } }],
  });

  // Vollständiger Menüname inkl. Beschreibung, damit gleichnamige Varianten
  // (z. B. "Gemischter Salatteller – mit Thunfisch") unterscheidbar sind.
  function menuLabel(b: (typeof bookings)[number]): string {
    const desc = b.dish?.description?.trim();
    return desc ? `${b.dishTitleSnapshot} – ${desc}` : b.dishTitleSnapshot;
  }

  // Bestellungen nach vollständigem Menünamen + Name gruppieren/sortieren
  const rows = [...bookings].sort(
    (a, b) =>
      menuLabel(a).localeCompare(menuLabel(b), "de") ||
      a.user.name.localeCompare(b.user.name, "de"),
  );

  // Zusammenfassung: Menü (inkl. Beschreibung) → Anzahl
  const summary = new Map<string, number>();
  for (const b of bookings) {
    const label = menuLabel(b);
    summary.set(label, (summary.get(label) ?? 0) + 1);
  }
  const summaryRows = [...summary.entries()].sort((a, b) => b[1] - a[1]);

  // Schnellauswahl: Werktage der aktuellen Woche (Mo–Fr)
  const quickDays = weekdays(0);

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Bestellungen</h1>
          <p className="mt-1 text-ink-soft">{formatGermanDate(selected)}</p>
        </div>
        <a
          href={`/admin/bestellungen/export?date=${selected}`}
          className="rounded-full bg-herb-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-herb-500"
        >
          ⬇ CSV-Export
        </a>
      </header>

      {/* Datumsauswahl */}
      <div className="mb-6 rounded-2xl border border-sand-200 bg-white p-4">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="date" className="mb-1 block text-sm font-medium text-ink">Datum wählen</label>
            <input id="date" type="date" name="date" defaultValue={selected} className="rounded-lg border border-sand-300 px-3 py-2 text-sm" />
          </div>
          <button className="rounded-full bg-brand-700 px-5 py-2 text-sm font-semibold text-sand-50">Anzeigen</button>
        </form>
        {quickDays.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {quickDays.map((d) => (
              <Link
                key={d.iso}
                href={`/admin/bestellungen?date=${d.iso}`}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  d.iso === selected ? "bg-brand-700 text-sand-50" : "bg-sand-100 text-ink hover:bg-sand-200"
                }`}
              >
                {d.dayLabel}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        {/* Zusammenfassung */}
        <section className="min-w-0 rounded-2xl border border-sand-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-ink">Zusammenfassung</h2>
          {summaryRows.length === 0 ? (
            <p className="text-ink-soft">Keine Bestellungen für diesen Tag.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sand-200 text-left text-ink-soft">
                    <th className="py-2">Menü</th>
                    <th className="py-2 text-right">Anzahl</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.map(([title, count]) => (
                    <tr key={title} className="border-b border-sand-100">
                      <td className="py-2 text-ink">{title}</td>
                      <td className="py-2 text-right font-semibold text-brand-700">{count}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-2 font-semibold text-ink">Gesamt</td>
                    <td className="py-2 text-right font-semibold text-ink">{bookings.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Personenliste */}
        <section className="min-w-0 rounded-2xl border border-sand-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-ink">Wer hat was bestellt</h2>
          {bookings.length === 0 ? (
            <p className="text-ink-soft">Keine Bestellungen für diesen Tag.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sand-200 text-left text-ink-soft">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Menü</th>
                    <th className="py-2">Sonderwunsch</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => (
                    <tr key={b.id} className="border-b border-sand-100">
                      <td className="py-2 pr-4 text-ink whitespace-nowrap">{b.user.name}</td>
                      <td className="py-2 pr-4 text-ink whitespace-nowrap">{menuLabel(b)}</td>
                      <td className="py-2 text-ink-soft">{b.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
