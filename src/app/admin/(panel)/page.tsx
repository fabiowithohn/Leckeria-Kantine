import Link from "next/link";
import { prisma } from "@/lib/db";
import { dbDateFromISO, todayBerlinISO, weekdays } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata = { title: "Übersicht – Verwaltung" };

export default async function AdminDashboard() {
  const today = todayBerlinISO();
  const nextBookable = [...weekdays(0), ...weekdays(1)].find((d) => !d.isPast);

  const [libraryDishes, assignments, employees, todayCount, nextCount] = await Promise.all([
    prisma.dish.count(),
    prisma.menuAssignment.count({ where: { active: true } }),
    prisma.user.count({ where: { emailVerified: { not: null } } }),
    prisma.booking.count({ where: { date: dbDateFromISO(today) } }),
    nextBookable
      ? prisma.booking.count({ where: { date: dbDateFromISO(nextBookable.iso) } })
      : Promise.resolve(0),
  ]);

  const stats = [
    { label: "Gerichte in der Bibliothek", value: libraryDishes },
    { label: "Aktive Zuordnungen (Wochentage)", value: assignments },
    { label: "Registrierte Mitarbeitende", value: employees },
    { label: "Bestellungen heute", value: todayCount },
  ];

  const cards = [
    { href: "/admin/grenzebach", title: "Grenzebach-Gerichte", text: "Bibliothek pflegen & Gerichte den Wochentagen zuordnen." },
    { href: "/admin/benutzer", title: "Mitarbeitende", text: "Registrierte Konten verwalten: Namen ändern, Passwörter zurücksetzen." },
    { href: "/admin/speisekarte", title: "Asteel Flash", text: "Wöchentlichen Speiseplan als Bild hochladen." },
    { href: "/admin/bestellungen", title: "Bestellungen", text: "Auswertung & CSV-Export der Kantinenbestellungen." },
    { href: "/admin/aktuelles", title: "Aktuelles", text: "Neuigkeiten auf der Website veröffentlichen." },
  ];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Übersicht</h1>
        <p className="mt-1 text-ink-soft">Willkommen im Verwaltungsbereich von Leckeria.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-sand-200 bg-white p-5">
            <p className="text-3xl font-semibold text-brand-700">{s.value}</p>
            <p className="mt-1 text-sm text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      {nextBookable && (
        <p className="mt-4 text-sm text-ink-soft">
          Nächster buchbarer Tag: <strong>{nextBookable.dayLabel}</strong> – bisher{" "}
          <strong>{nextCount}</strong> Bestellung(en).{" "}
          <Link href={`/admin/bestellungen?date=${nextBookable.iso}`} className="text-brand-700 underline">
            ansehen
          </Link>
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-2xl border border-sand-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-ink">{c.title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{c.text}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
              Öffnen <span className="transition group-hover:translate-x-1">→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
