"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type WeekdayCode, type DayInfo } from "@/lib/time";
import { allergensByNrs, additivesByCodes } from "@/lib/allergens";
import { MarkIcon } from "@/components/mark-icon";
import { setDishOrder } from "@/app/(site)/grenzebach/booking-actions";

const MAX_PORTIONS = 20;

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

/**
 * Eine Gericht-Karte mit Mengen-Stepper und – bei Freitext-Gerichten – einem
 * Sonderwunsch-Feld pro Portion. Eigenständige Komponente mit lokalem State,
 * damit Tippen flüssig bleibt (kein Fokusverlust).
 */
function DishCard({
  dish,
  savedNotes,
  bookable,
  pending,
  onSave,
}: {
  dish: DishDTO;
  savedNotes: string[];
  bookable: boolean;
  pending: boolean;
  onSave: (dishId: string, notes: string[]) => void;
}) {
  const [draft, setDraft] = useState<string[]>(savedNotes);
  const qty = draft.length;

  function commit(next: string[]) {
    setDraft(next);
    onSave(dish.id, next);
  }
  function inc() {
    if (qty < MAX_PORTIONS) commit([...draft, ""]);
  }
  function dec() {
    if (qty > 0) commit(draft.slice(0, qty - 1));
  }

  const stepBtn =
    "grid h-9 w-9 place-items-center rounded-full border border-sand-300 text-lg font-bold text-ink transition hover:bg-sand-100 disabled:opacity-40";

  const titleEl = (
    <p className="font-bold text-ink">
      {dish.title}
      {qty > 0 && (
        <span className="ml-2 rounded-full bg-herb-500/15 px-2 py-0.5 text-xs font-bold text-herb-600">
          {qty}× gebucht
        </span>
      )}
    </p>
  );

  const descEl = dish.description ? (
    <p className="text-sm text-ink-soft">{dish.description}</p>
  ) : null;

  const hasMarks = dish.allergens.length > 0 || dish.additives.length > 0;
  const badgesEl = <MarkBadges allergens={dish.allergens} additives={dish.additives} />;

  const stepperEl = (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        onClick={dec}
        disabled={!bookable || pending || qty === 0}
        aria-label="Eine Portion weniger"
        className={stepBtn}
      >
        −
      </button>
      <span className="w-6 text-center text-lg font-extrabold text-ink">{qty}</span>
      <button
        type="button"
        onClick={inc}
        disabled={!bookable || pending || qty >= MAX_PORTIONS}
        aria-label="Eine Portion mehr"
        className={stepBtn}
      >
        +
      </button>
    </div>
  );

  return (
    <li
      className={`rounded-2xl border p-3 sm:p-4 ${
        qty > 0 ? "border-herb-500/50 bg-herb-500/5" : "border-sand-200 bg-white"
      }`}
    >
      {/* Mobil: Name oben · darunter Bild + Mengenwahl · darunter Allergene */}
      <div className="sm:hidden">
        <div className="min-w-0">
          {titleEl}
          {descEl}
        </div>
        <div className="mt-3 flex items-center gap-4">
          <DishImage dish={dish} />
          <div className="ml-auto">{stepperEl}</div>
        </div>
        {hasMarks && <div className="mt-3">{badgesEl}</div>}
      </div>

      {/* Ab sm: kompakte Zeile (Bild · Text · Mengenwahl) */}
      <div className="hidden items-center gap-4 sm:flex">
        <DishImage dish={dish} />
        <div className="min-w-0 flex-1">
          {titleEl}
          {descEl}
          {badgesEl}
        </div>
        {stepperEl}
      </div>

      {/* Sonderwunsch je Portion (nur wenn erlaubt und mind. 1 Portion) */}
      {dish.allowNote && qty > 0 && (
        <div className="mt-3 space-y-2 border-t border-sand-200/70 pt-3">
          <p className="text-xs font-semibold text-ink-soft">Sonderwünsche (optional)</p>
          {draft.map((n, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs text-ink-soft">Portion {i + 1}</span>
              <input
                type="text"
                value={n}
                disabled={!bookable || pending}
                maxLength={300}
                placeholder="z. B. ohne Zwiebeln"
                onChange={(e) =>
                  setDraft((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                }
                onBlur={() => onSave(dish.id, draft)}
                className="min-w-0 flex-1 rounded-xl border border-sand-300 bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:opacity-60"
              />
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

type WeekDTO = { offset: 0 | 1; label: string; days: DayInfo[] };

type Props = {
  dailyFixed: DishDTO[];
  byWeekday: Record<WeekdayCode, DishDTO[]>;
  weeks: WeekDTO[];
  bookings: Record<string, { dishId: string; note: string | null }[]>;
};

export function BookingDashboard({ dailyFixed, byWeekday, weeks, bookings }: Props) {
  const router = useRouter();
  const [weekIdx, setWeekIdx] = useState(0);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  // Lokaler (optimistischer) Stand der Tagesbestellungen: Die UI reagiert sofort,
  // ohne nach jeder Aktion die ganze Seite neu vom Server zu laden.
  const [localBookings, setLocalBookings] = useState(bookings);
  useEffect(() => setLocalBookings(bookings), [bookings]);

  const week = weeks[weekIdx];
  const firstBookable = week.days.find((d) => d.bookable) ?? week.days[0];
  const [dayIso, setDayIso] = useState<string>(firstBookable?.iso ?? "");

  function changeWeek(idx: number) {
    setWeekIdx(idx);
    const w = weeks[idx];
    setDayIso((w.days.find((d) => d.bookable) ?? w.days[0])?.iso ?? "");
    setFeedback(null);
  }

  const day: DayInfo | undefined = week.days.find((d) => d.iso === dayIso);
  const weekdayDishes = day ? byWeekday[day.weekday] : [];
  const dayPortions = day ? localBookings[day.iso] ?? [] : [];

  const allDishes = [...dailyFixed, ...Object.values(byWeekday).flat()];
  const titleById = new Map(allDishes.map((d) => [d.id, d.title]));
  const allowNoteById = new Map(allDishes.map((d) => [d.id, d.allowNote]));

  // Zusammenfassung der Tagesbestellung ("2× Burger, 1× Salat")
  const countByDish = new Map<string, number>();
  for (const p of dayPortions) countByDish.set(p.dishId, (countByDish.get(p.dishId) ?? 0) + 1);
  const summaryText = [...countByDish.entries()]
    .map(([id, c]) => `${c}× ${titleById.get(id) ?? "Gericht"}`)
    .join(", ");

  function savedNotesFor(dishId: string): string[] {
    return dayPortions.filter((p) => p.dishId === dishId).map((p) => p.note ?? "");
  }

  function saveDish(dishId: string, notes: string[]) {
    if (!day) return;
    const iso = day.iso;
    const title = titleById.get(dishId) ?? "Gericht";
    const allowNote = allowNoteById.get(dishId) ?? false;

    // Sofort optimistisch im lokalen Stand spiegeln (snappy, kein Full-Refresh).
    setLocalBookings((prev) => {
      const others = (prev[iso] ?? []).filter((p) => p.dishId !== dishId);
      const updated = notes.map((n) => ({
        dishId,
        note: allowNote && n.trim() ? n.trim().slice(0, 300) : null,
      }));
      return { ...prev, [iso]: [...others, ...updated] };
    });

    // Im Hintergrund speichern; nur bei Fehler den echten Serverstand zurückholen.
    startTransition(async () => {
      const res = await setDishOrder(dishId, iso, notes);
      if (res.error) {
        setFeedback({ kind: "err", text: res.error });
        router.refresh();
      } else {
        setFeedback({
          kind: "ok",
          text:
            notes.length > 0
              ? `„${title}“ aktualisiert (${notes.length}×).`
              : `„${title}“ entfernt.`,
        });
      }
    });
  }

  function renderDish(dish: DishDTO) {
    return (
      <DishCard
        key={`${day?.iso ?? ""}-${dish.id}`}
        dish={dish}
        savedNotes={savedNotesFor(dish.id)}
        bookable={!!day?.bookable}
        pending={pending}
        onSave={saveDish}
      />
    );
  }

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
                {dayPortions.length > 0 ? (
                  <p className="text-sm text-ink-soft">
                    Deine Bestellung: <strong>{summaryText}</strong>
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
              <ul className="space-y-3">{weekdayDishes.map(renderDish)}</ul>
            </section>
          )}

          {/* Täglich verfügbar */}
          {dailyFixed.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-herb-600">
                Täglich verfügbar
              </h3>
              <ul className="space-y-3">{dailyFixed.map(renderDish)}</ul>
            </section>
          )}

          {weekdayDishes.length === 0 && dailyFixed.length === 0 && (
            <p className="text-ink-soft">Für diesen Tag sind aktuell keine Gerichte hinterlegt.</p>
          )}

          <p className="mt-5 text-xs text-ink-soft">
            Hinweis: Du kannst mehrere Gerichte und Portionen über die Anzahl (− / +)
            bestellen. Änderungen werden automatisch gespeichert – Änderung/Stornierung
            bis 09:30 Uhr am Bestelltag.
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
