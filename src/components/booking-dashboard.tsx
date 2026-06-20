"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type WeekdayCode, type DayInfo } from "@/lib/time";
import { allergensByNrs, additivesByCodes } from "@/lib/allergens";
import { MarkIcon } from "@/components/mark-icon";
import { bookDish, cancelBooking } from "@/app/(site)/grenzebach/booking-actions";

export type DishDTO = {
  id: string;
  title: string;
  description: string | null;
  allergens: string[];
  additives: string[];
  allowNote: boolean;
  hasImage: boolean;
  imageVersion: string;
};

/** Kleine Allergen- und Zusatzstoff-Icons unter einem Gericht. */
function MarkBadges({ allergens, additives }: { allergens: string[]; additives: string[] }) {
  const allergenList = allergensByNrs(allergens);
  const additiveList = additivesByCodes(additives);
  if (allergenList.length === 0 && additiveList.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {allergenList.map((a) => (
        <span
          key={`al-${a.nr}`}
          title={`${a.nr} – ${a.name}`}
          className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2 py-0.5 text-xs font-semibold text-ink-soft"
        >
          <MarkIcon path={a.iconPath} className="h-3.5 w-3.5" />
          {a.nr}
        </span>
      ))}
      {additiveList.map((a) => (
        <span
          key={`ad-${a.code}`}
          title={`${a.code} – ${a.category}`}
          className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2 py-0.5 text-xs font-semibold text-ink-soft"
        >
          <MarkIcon path={a.iconPath} className="h-3.5 w-3.5" />
          {a.code}
        </span>
      ))}
    </div>
  );
}

type WeekDTO = { offset: 0 | 1; label: string; days: DayInfo[] };

type Props = {
  dailyFixed: DishDTO[];
  byWeekday: Record<WeekdayCode, DishDTO[]>;
  weeks: WeekDTO[];
  bookings: Record<string, { dishId: string; title: string; note: string | null }>;
};

function DishImage({ dish }: { dish: DishDTO }) {
  if (dish.hasImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={`/api/dish-image/${dish.id}?v=${encodeURIComponent(dish.imageVersion)}`}
        alt={dish.title}
        className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-sand-200 sm:h-24 sm:w-24"
      />
    );
  }
  return (
    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-sand-100 text-2xl sm:h-24 sm:w-24">
      🍽️
    </div>
  );
}

export function BookingDashboard({ dailyFixed, byWeekday, weeks, bookings }: Props) {
  const router = useRouter();
  const [weekIdx, setWeekIdx] = useState(0);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  // Sonderwünsche pro Tag+Gericht (Freitext), keyed by `${iso}-${dishId}`
  const [notes, setNotes] = useState<Record<string, string>>({});

  const week = weeks[weekIdx];
  const firstBookable = week.days.find((d) => d.bookable) ?? week.days[0];
  const [dayIso, setDayIso] = useState<string>(firstBookable?.iso ?? "");

  function changeWeek(idx: number) {
    setWeekIdx(idx);
    const w = weeks[idx];
    setDayIso((w.days.find((d) => d.bookable) ?? w.days[0])?.iso ?? "");
    setFeedback(null);
  }

  function run(action: () => Promise<{ ok?: boolean; error?: string }>, okText: string) {
    // Bewusst KEIN setFeedback(null) vorab: die bisherige Meldung bleibt stehen,
    // bis sie nahtlos durch die neue ersetzt wird (kein Layout-Sprung dazwischen).
    startTransition(async () => {
      const res = await action();
      if (res.error) setFeedback({ kind: "err", text: res.error });
      else setFeedback({ kind: "ok", text: okText });
      router.refresh();
    });
  }

  const day: DayInfo | undefined = week.days.find((d) => d.iso === dayIso);
  const currentBooking = day ? bookings[day.iso] : undefined;
  const weekdayDishes = day ? byWeekday[day.weekday] : [];

  function DishRow({ dish }: { dish: DishDTO }) {
    const isBooked = currentBooking?.dishId === dish.id;
    const noteKey = `${day?.iso ?? ""}-${dish.id}`;
    const savedNote = isBooked ? currentBooking?.note ?? "" : "";
    const noteValue = notes[noteKey] ?? savedNote;
    const noteChanged = noteValue.trim() !== savedNote.trim();
    return (
      <li
        className={`rounded-2xl border p-3 sm:p-4 ${
          isBooked ? "border-herb-500/50 bg-herb-500/5" : "border-sand-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-4">
          <DishImage dish={dish} />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink">{dish.title}</p>
            {dish.description && <p className="text-sm text-ink-soft">{dish.description}</p>}
            <MarkBadges allergens={dish.allergens} additives={dish.additives} />
          </div>
          {isBooked ? (
            <div className="flex shrink-0 items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-herb-500/15 px-4 py-2 text-sm font-bold text-herb-600">
                ✓ Gebucht
              </span>
              <button
                disabled={pending || !day?.bookable}
                onClick={() => day && run(() => cancelBooking(day.iso), "Bestellung storniert.")}
                className="rounded-full border-2 border-brand-500 px-4 py-2 text-sm font-bold text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
              >
                Stornieren
              </button>
            </div>
          ) : (
            <button
              disabled={pending || !day?.bookable}
              onClick={() =>
                day &&
                run(
                  () => bookDish(dish.id, day.iso, dish.allowNote ? noteValue : undefined),
                  `„${dish.title}“ für ${day.label} gebucht.`,
                )
              }
              className="shrink-0 rounded-full bg-brand-500 px-5 py-2 text-sm font-extrabold text-white shadow-warm transition hover:bg-brand-600 disabled:opacity-50"
            >
              {currentBooking ? "Wählen" : "Bestellen"}
            </button>
          )}
        </div>

        {dish.allowNote && (
          <div className="mt-3 border-t border-sand-200/70 pt-3">
            <label className="mb-1 block text-xs font-semibold text-ink-soft">
              Sonderwunsch (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={noteValue}
                disabled={!day?.bookable}
                maxLength={300}
                onChange={(e) => setNotes((prev) => ({ ...prev, [noteKey]: e.target.value }))}
                placeholder="z. B. ohne Zwiebeln"
                className="min-w-[12rem] flex-1 rounded-xl border border-sand-300 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:opacity-60"
              />
              {isBooked && noteChanged && (
                <button
                  disabled={pending || !day?.bookable}
                  onClick={() =>
                    day &&
                    run(() => bookDish(dish.id, day.iso, noteValue), "Sonderwunsch gespeichert.")
                  }
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-warm transition hover:bg-brand-600 disabled:opacity-50"
                >
                  Notiz speichern
                </button>
              )}
            </div>
          </div>
        )}
      </li>
    );
  }

  // Alle in der Speisekarte vorkommenden Allergene & Zusatzstoffe (für die Aufschlüsselung unten)
  const allDishes = [...dailyFixed, ...Object.values(byWeekday).flat()];
  const presentAllergens = allergensByNrs(
    Array.from(new Set(allDishes.flatMap((d) => d.allergens))),
  );
  const presentAdditives = additivesByCodes(
    Array.from(new Set(allDishes.flatMap((d) => d.additives))),
  );

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-warm">
      {/* Wochenwahl – nur anzeigen, wenn es mehr als eine Woche gibt */}
      {weeks.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-sand-200 bg-sand-50 px-5 py-4">
          <span className="mr-2 text-sm font-bold text-ink-soft">Woche:</span>
          {weeks.map((w, i) => (
            <button
              key={w.offset}
              onClick={() => changeWeek(i)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                i === weekIdx ? "bg-brand-500 text-white shadow-warm" : "bg-white text-ink hover:bg-sand-100"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      )}

      {/* Tagesauswahl (Wochentag + Datum) */}
      <div className="flex gap-2 overflow-x-auto border-b border-sand-200 px-4 py-4">
        {week.days.map((d) => (
          <button
            key={d.iso}
            onClick={() => {
              setDayIso(d.iso);
              setFeedback(null);
            }}
            className={`min-w-[5.5rem] rounded-2xl border px-3 py-2 text-center transition ${
              d.iso === dayIso
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-sand-200 bg-white text-ink hover:bg-sand-100"
            } ${!d.bookable ? "opacity-60" : ""}`}
          >
            <span className="block text-sm font-extrabold">{d.label}</span>
            <span className="block text-xs text-ink-soft">{d.dayLabel}</span>
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-7">
        {feedback && (
          <p
            className={`mb-5 rounded-xl px-4 py-3 text-sm font-medium ${
              feedback.kind === "ok" ? "bg-herb-500/10 text-herb-600" : "bg-brand-100 text-brand-700"
            }`}
          >
            {feedback.text}
          </p>
        )}

        {/* Tageskopf */}
        {day && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sand-50 px-4 py-3">
            <div>
              <p className="font-bold text-ink">
                {day.label} · {day.dayLabel}
              </p>
              {currentBooking ? (
                <p className="text-sm text-ink-soft">
                  Deine Bestellung: <strong>{currentBooking.title}</strong>
                </p>
              ) : (
                <p className="text-sm text-ink-soft">Noch keine Bestellung für diesen Tag.</p>
              )}
            </div>
            {!day.bookable && (
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                {day.isPast ? "Vergangener Tag" : "Bestellschluss vorbei"}
              </span>
            )}
          </div>
        )}

        {/* Tagesmenü */}
        {weekdayDishes.length > 0 && (
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-brand-500">
              Tagesmenü
            </h3>
            <ul className="space-y-3">
              {weekdayDishes.map((dish) => (
                <DishRow key={dish.id} dish={dish} />
              ))}
            </ul>
          </section>
        )}

        {/* Täglich verfügbar */}
        {dailyFixed.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-herb-600">
              Täglich verfügbar
            </h3>
            <ul className="space-y-3">
              {dailyFixed.map((dish) => (
                <DishRow key={dish.id} dish={dish} />
              ))}
            </ul>
          </section>
        )}

        {weekdayDishes.length === 0 && dailyFixed.length === 0 && (
          <p className="text-ink-soft">Für diesen Tag sind aktuell keine Gerichte hinterlegt.</p>
        )}

        <p className="mt-5 text-xs text-ink-soft">
          Hinweis: Pro Tag ist genau eine Bestellung möglich. „Bestellen“
          ersetzt deine aktuelle Auswahl. Änderung/Stornierung bis 09:30 Uhr am
          Bestelltag.
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          Bei den gezeigten Gerichten, handelt es sich um Beispielbilder.
          Abweichungen sind möglich.
        </p>
      </div>
      </div>

      {/* Aufschlüsselung der Allergene */}
      {presentAllergens.length > 0 && (
        <section className="mt-6 rounded-3xl border border-sand-200 bg-white p-5 sm:p-7">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-500">
            Allergene
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Die Symbole bei den Gerichten verweisen auf die folgenden
            kennzeichnungspflichtigen Allergene.
          </p>
          <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {presentAllergens.map((a) => (
              <li key={a.nr} className="flex items-start gap-2 text-sm">
                <MarkIcon path={a.iconPath} className="mt-0.5 h-5 w-5 shrink-0 text-ink-soft" />
                <span>
                  <span className="font-bold text-ink">{a.nr} {a.name}</span>
                  <span className="text-ink-soft"> – {a.hint}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-soft">
            Rechtsgrundlage: EU-Verordnung Nr. 1169/2011 über die Information der
            Verbraucher über Lebensmittel (LMIV).
          </p>
        </section>
      )}

      {/* Aufschlüsselung der Zusatzstoffe */}
      {presentAdditives.length > 0 && (
        <section className="mt-6 rounded-3xl border border-sand-200 bg-white p-5 sm:p-7">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-herb-600">
            Kennzeichnungspflichtige Zusatzstoffe
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Die Buchstaben bei den Gerichten verweisen auf die folgenden
            Zusatzstoffe.
          </p>
          <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {presentAdditives.map((a) => (
              <li key={a.code} className="flex items-start gap-2 text-sm">
                <MarkIcon path={a.iconPath} className="mt-0.5 h-5 w-5 shrink-0 text-ink-soft" />
                <span>
                  <span className="font-bold text-ink">{a.code}) {a.category}</span>
                  <span className="text-ink-soft"> – {a.note}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-soft">
            Rechtsgrundlage: Zusatzstoff-Zulassungsverordnung (ZZulV) sowie
            EU-Verordnung Nr. 1333/2008 über Lebensmittelzusatzstoffe.
          </p>
        </section>
      )}
    </>
  );
}
