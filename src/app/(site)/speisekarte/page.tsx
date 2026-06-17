import { Container, SectionHeading, Badge } from "@/components/ui";
import { getPlanMeta } from "@/lib/weekly-plan";
import { PlanViewer } from "@/components/plan-viewer";
import { ALLERGENS, ADDITIVES } from "@/lib/allergens";

export const dynamic = "force-dynamic";
export const metadata = { title: "Asteel Flash – Wochenplan" };

export default async function AsteelFlashPage() {
  const plan = await getPlanMeta();
  const src = plan?.hasImage
    ? `/api/asteel-flash-plan?v=${encodeURIComponent(plan.version)}`
    : null;

  return (
    <div className="py-16">
      <Container>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="open">Öffentliche Kantine</Badge>
        </div>
        <div className="mt-3">
          <SectionHeading
            eyebrow="Kantine Asteel Flash"
            title="Speiseplan dieser Woche"
            intro="Unser aktueller Wochenspeiseplan für die öffentliche Kantine Asteel Flash."
          />
        </div>

        <div className="mt-6 max-w-3xl space-y-4 text-lg leading-relaxed text-ink-soft">
          <p>
            In der Leckeria Kantine in der Konrad-Zuse-Straße 19 erwarten dich
            jede Woche zwei frisch zusammengestellte Menüs zur Auswahl. Unsere
            Speisekarte wird regelmäßig aktualisiert, sodass du immer sehen
            kannst, was dich in der aktuellen Woche erwartet.
          </p>
          <p>
            Alle Allergene sind transparent in der Allergenliste gekennzeichnet,
            damit du genau weißt, was in deinem Essen enthalten ist.
          </p>
          <p>
            Schau gerne vorbei und entdecke, was diese Woche Leckeres auf dem
            Speiseplan steht!
          </p>
        </div>

        {/* Standort & Anfahrt */}
        <section className="mt-10 overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-warm">
          <div className="grid lg:grid-cols-[1.4fr_1fr]">
            <div className="p-7 sm:p-8">
              <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-brand-500">
                <span className="h-1.5 w-1.5 rounded-full bg-herb-500" />
                Standort &amp; Anfahrt
              </p>
              <h2 className="text-2xl text-ink sm:text-3xl">So findest du uns</h2>
              <div className="mt-4 space-y-4 leading-relaxed text-ink-soft">
                <p>
                  Du suchst eine leckere und abwechslungsreiche Mittagspause? Dann
                  bist du in unserer Kantine bei Asteel Flash in der
                  Konrad-Zuse-Straße 19 in Bad Hersfeld genau richtig!
                </p>
                <p>
                  Von Montag bis Freitag, 7:15 bis 13:30 Uhr, bieten wir dir
                  täglich wechselnde Menüs, die mit viel Liebe und frischen Zutaten
                  zubereitet werden. Für Gäste von außerhalb beträgt der Festpreis
                  nur 8,90 €. Parkplätze sind vorhanden, und die Kantine ist bequem
                  fußläufig über das Firmengelände von Asteel Flash erreichbar.
                </p>
                <p>
                  Den aktuellen Speiseplan findest du immer hier auf dieser Seite.
                  Komm vorbei und gönn dir eine kulinarische Pause – wir freuen uns
                  auf dich!
                </p>
              </div>
            </div>

            <div className="border-t border-sand-200 bg-sand-50 p-7 sm:p-8 lg:border-l lg:border-t-0">
              <ul className="space-y-5">
                {[
                  {
                    label: "Adresse",
                    value: "Konrad-Zuse-Straße 19, 36251 Bad Hersfeld",
                    icon: "M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z",
                    extra: <circle cx="12" cy="11" r="2.2" />,
                  },
                  {
                    label: "Öffnungszeiten",
                    value: "Mo–Fr, 7:15 – 13:30 Uhr",
                    icon: "M12 8v4l3 1.6 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
                  },
                  {
                    label: "Festpreis für Gäste",
                    value: "8,90 €",
                    icon: "M16.5 8a4.5 4.5 0 1 0 0 8 M6 11h6 M6 14h5",
                  },
                  {
                    label: "Anfahrt",
                    value: "Parkplätze vorhanden · fußläufig über das Firmengelände",
                    icon: "M5 11l1.4-4.2A2 2 0 0 1 8.3 5.4h7.4a2 2 0 0 1 1.9 1.4L19 11m-14 0h14m-14 0v5m14-5v5M7.5 16h1.5m6 0h1.5",
                  },
                ].map((f) => (
                  <li key={f.label} className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={f.icon} />
                        {f.extra}
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">
                        {f.label}
                      </p>
                      <p className="font-bold text-ink">{f.value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="mt-10">
          {src ? (
            <PlanViewer src={src} title={plan?.title} />
          ) : (
            <div className="rounded-3xl border border-dashed border-sand-300 bg-white p-16 text-center">
              <p className="text-4xl">🍽️</p>
              <p className="mt-3 font-bold text-ink">
                Der Speiseplan wird gerade aktualisiert.
              </p>
              <p className="mt-1 text-ink-soft">
                Schau in Kürze wieder vorbei – der neue Wochenplan ist bald hier
                verfügbar.
              </p>
            </div>
          )}
        </div>

        {/* Allergene */}
        <section className="mt-16">
          <SectionHeading
            eyebrow="Kennzeichnung"
            title="Allergene"
            intro="Die Zahlen auf dem Speiseplan verweisen auf die folgenden kennzeichnungspflichtigen Allergene."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALLERGENS.map((a) => (
              <div key={a.nr} className="flex gap-3 rounded-2xl border border-sand-200 bg-white p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500 text-sm font-extrabold text-white">
                  {a.nr}
                </span>
                <div>
                  <p className="font-bold text-ink">{a.name}</p>
                  <p className="text-sm text-ink-soft">{a.hint}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Rechtsgrundlage: EU-Verordnung Nr. 1169/2011 über die Information der
            Verbraucher über Lebensmittel (LMIV).
          </p>
        </section>

        {/* Kennzeichnungspflichtige Zusatzstoffe */}
        <section className="mt-14">
          <SectionHeading
            eyebrow="Kennzeichnung"
            title="Kennzeichnungspflichtige Zusatzstoffe"
            intro="Die Buchstaben auf dem Speiseplan verweisen auf die folgenden Zusatzstoffe."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ADDITIVES.map((z) => (
              <div key={z.code} className="flex gap-3 rounded-2xl border border-sand-200 bg-white p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-herb-500 text-sm font-extrabold text-white">
                  {z.code}
                </span>
                <div>
                  <p className="font-bold text-ink">{z.category}</p>
                  <p className="text-sm text-ink-soft">{z.note}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Rechtsgrundlage: Zusatzstoff-Zulassungsverordnung (ZZulV) sowie
            EU-Verordnung Nr. 1333/2008 über Lebensmittelzusatzstoffe.
          </p>
        </section>
      </Container>
    </div>
  );
}
