import Image from "next/image";
import { Container, SectionHeading, ButtonLink } from "@/components/ui";
import { ImageGallery } from "@/components/ui/image-gallery";
import { FIRMEN_IMAGES } from "@/lib/gallery-data";

export const metadata = {
  title: "Für Firmen",
  description:
    "Brötchenautomaten von Leckeria – die unkomplizierte Mitarbeiterverpflegung für Unternehmen ohne eigene Kantine. Täglich frisch befüllt, seit 2020 bewährt.",
};

const VORTEILE = [
  {
    title: "Alternative zur teuren Kantine",
    text: "Kein Investitionsaufwand in Küche, Personal oder Betrieb, kein Hygieneaufwand einer Großküche – flexibel skalierbar für 10 bis 500+ Mitarbeiter.",
    icon: "M3 21h18M5 21V7l8-4 8 4v14M9 9h.01M9 13h.01M9 17h.01",
  },
  {
    title: "Zufriedene & produktive Teams",
    text: "Eine ausgewogene Mahlzeit steigert Konzentration und Wohlbefinden, senkt Krankheitsausfälle und stärkt durch gemeinsame Pausen den Teamzusammenhalt.",
    icon: "M16 11a4 4 0 1 0-8 0M3 21v-1a6 6 0 0 1 12 0v1M17 21v-1a6 6 0 0 0-3-5.2",
  },
  {
    title: "Employer Branding",
    text: "76 % der Führungskräfte sehen Verpflegung als stärksten Bindungsfaktor. Ein sichtbarer Benefit, der im Fachkräftewettbewerb überzeugt und die Fluktuation senkt.",
    icon: "M12 2l2.4 7.4H22l-6 4.4 2.3 7.2-6.3-4.6L5.7 21l2.3-7.2-6-4.4h7.6z",
  },
  {
    title: "Steuerlich attraktiv",
    text: "Snacks und Gebäck sind 100 % als Betriebsausgabe absetzbar, Essenszuschüsse steuerbegünstigt – ein günstiger Hebel für die Mitarbeiterverpflegung.",
    icon: "M9 7h6M9 12h6M9 17h4M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z",
  },
  {
    title: "Transparenz & Vertrauen",
    text: "Klare Preislisten direkt am Automaten, faire Versorgung für alle und Raum für Feedback – ohne das Gefühl ungleicher Behandlung.",
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM9 12l2 2 4-4",
  },
  {
    title: "Rundum versorgt",
    text: "Tägliche Frischbefüllung, 24/7 verfügbar für Schichtarbeiter, geringer Platzbedarf – Wartung und Auffüllung übernimmt Leckeria komplett.",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
];

const ZIELGRUPPEN = [
  ["Produktions- & Fertigungsbetriebe", "Schichtarbeiter brauchen frühe Versorgung, oft keine Kantine vorhanden."],
  ["Logistikunternehmen", "Verteilt arbeitende Teams mit wenig Zeit für Außerverpflegung."],
  ["Handwerksbetriebe & Werkstätten", "Zu klein für eine eigene Kantine, aber Bedarf ist da."],
  ["Büro- & Dienstleistungsbetriebe", "Ideale Ergänzung zu bestehenden Pausenräumen."],
  ["Pflege- & Sozialeinrichtungen", "24-Stunden-Betrieb mit Nachtschichten."],
  ["KMU ab ca. 20 Mitarbeitern", "Erste professionelle Verpflegung ohne Kantinenaufbau."],
];

const ARGUMENTE = [
  "Plug & Play – Leckeria liefert, befüllt und wartet täglich",
  "Keine eigene Kantine nötig – ideal für jede Unternehmensgröße",
  "Steuerlich absetzbar – 100 % Betriebsausgabe",
  "Mitarbeiterbindung – 76 % der Führungskräfte sehen Verpflegung als stärksten Bindungsfaktor",
  "Employer Branding – sichtbarer Benefit im Fachkräftewettbewerb",
  "Regional & frisch – täglich mit frischen Produkten befüllt",
  "Seit 2020 bewährt – nachgewiesene Erfahrung mit Betrieben der Region",
  "Maßgeschneidert – von der Einzellösung bis zum Mehrstandort-Konzept",
  "Entlastung für HR & Management – kein organisatorischer Aufwand",
  "Zufriedenere Mitarbeiter – weniger Krankheitsausfälle, bessere Stimmung",
];

export default function FuerFirmenPage() {
  return (
    <>
      {/* Hero mit Bild neben dem Text */}
      <section className="grain relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-500 to-brand-600 text-white">
        <div className="pointer-events-none absolute right-1/4 top-0 h-64 w-64 translate-x-1/2 rounded-full bg-gold-400/25 blur-3xl" />
        <Container className="relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div className="flex flex-col">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-gold-400" />
              Für Firmen · seit 2020 bewährt
            </span>
            <h1 className="text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">
              Brötchenautomaten für deine Firma
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/90">
              Die innovative Lösung für Unternehmen ohne eigene Kantine: Unsere
              Brötchenautomaten werden täglich frisch mit Brötchen, Snacks und
              Gebäck befüllt – so versorgen sich deine Mitarbeiter direkt vor
              Ort, ganz ohne den Weg zum Bäcker.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/kontakt" variant="light">
                Jetzt beraten lassen
              </ButtonLink>
              <a
                href="#vorteile"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/70 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/15"
              >
                Vorteile entdecken
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gold-400/25 blur-2xl" />
            <Image
              src="/firmen/main.jpg"
              alt="Leckeria Brötchenautomat im Betrieb"
              width={1001}
              height={782}
              priority
              className="h-auto w-full rounded-3xl border border-white/20 object-cover shadow-warm-lg"
            />
          </div>
        </Container>
      </section>

      {/* Vorteile */}
      <section id="vorteile" className="py-20">
        <Container>
          <SectionHeading
            center
            eyebrow="Warum Brötchenautomaten"
            title="Mitarbeiterverpflegung, die sich lohnt"
            intro="Gut verpflegte Mitarbeiter sind leistungsfähiger und zufriedener. Der Brötchenautomat von Leckeria schließt die Lücke, wo eine eigene Kantine nicht wirtschaftlich ist."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {VORTEILE.map((v) => (
              <div
                key={v.title}
                className="rounded-3xl border border-sand-200 bg-white p-7 transition hover:-translate-y-1.5 hover:shadow-warm"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d={v.icon} />
                  </svg>
                </span>
                <h3 className="mt-5 text-xl text-ink">{v.title}</h3>
                <p className="mt-2 text-ink-soft">{v.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Galerie */}
      <section className="bg-sand-100/60 py-20">
        <Container>
          <SectionHeading
            eyebrow="Galerie"
            title="Unsere Automaten in der Praxis"
            intro="Frische Brötchen, Snacks und Gebäck – täglich neu befüllt, direkt im Betrieb."
          />
          <div className="mt-10">
            <ImageGallery images={FIRMEN_IMAGES} label="Brötchenautomat" />
          </div>
        </Container>
      </section>

      {/* Zielgruppen */}
      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="Für wen geeignet?"
            title="Diese Unternehmen profitieren"
            intro="Vom Schichtbetrieb bis zum Büro – überall, wo eine eigene Kantine nicht in Frage kommt, ist der Automat die ideale Lösung."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ZIELGRUPPEN.map(([typ, warum]) => (
              <div key={typ} className="rounded-3xl border border-sand-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-ink">{typ}</h3>
                <p className="mt-2 text-sm text-ink-soft">{warum}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Argumente auf einen Blick */}
      <section className="py-20">
        <Container className="max-w-4xl">
          <SectionHeading
            center
            eyebrow="Auf einen Blick"
            title="10 gute Gründe für Leckeria"
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {ARGUMENTE.map((arg) => (
              <li key={arg} className="flex items-start gap-3 rounded-2xl border border-sand-200 bg-white p-4">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-herb-500/15 text-herb-600">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span className="text-sm text-ink">{arg}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Kontakt-CTA */}
      <section className="pb-24">
        <Container>
          <div className="grain relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-8 py-14 text-center text-white shadow-warm-lg">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/30 blur-2xl" />
            <h2 className="relative text-3xl sm:text-4xl">
              Kein eigener Kantinenbetrieb? Kein Problem.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/90">
              Sprich uns an – gemeinsam entwickeln wir das passende
              Verpflegungskonzept für deinen Betrieb, von der Einzellösung bis zum
              Mehrstandort-Konzept.
            </p>
            <div className="relative mt-7 flex justify-center">
              <ButtonLink href="/kontakt" variant="light">
                Unverbindlich anfragen
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
