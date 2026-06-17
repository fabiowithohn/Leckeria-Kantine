import { Container, SectionHeading, ButtonLink } from "@/components/ui";
import { ImageGallery } from "@/components/ui/image-gallery";
import { CATERING_IMAGES } from "@/lib/gallery-data";

export const metadata = { title: "Partyservice" };

const PACKAGES = [
  {
    name: "Essen",
    text: "In der Leckeria-Küche stehen Geschmack, Frische und Qualität an erster Stelle. Mit regionalen Zutaten und kreativer Vielfalt entstehen Gerichte, die begeistern – ob feines Fingerfood, bunte Buffets oder speziell abgestimmte Menüs. Jedes Gericht wird mit Liebe zum Detail zubereitet und sorgfältig präsentiert, damit jedes Essen zu einem besonderen Erlebnis wird.",
    icon: "M3 11h18M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M4 11l1 9h14l1-9",
    color: "bg-brand-50 text-brand-600",
  },
  {
    name: "Service",
    text: "Der Leckeria-Service macht jedes Event unkompliziert zum Genuss. Egal ob Firmenfeier, Familienfest oder Hochzeit – auf Wunsch wird einfach das Essen geliefert oder ein vollständiger Rundum-Service mit Geschirr, Getränken und erfahrenem Servicepersonal bereitgestellt. So kannst du dich entspannt auf die Feier konzentrieren, während Leckeria sich um alles kümmert.",
    icon: "M12 3v2M5 8h14l-1.5 11.5A2 2 0 0 1 15.5 21h-7a2 2 0 0 1-2-1.5L5 8z",
    color: "bg-gold-400/20 text-gold-500",
  },
  {
    name: "Fingerfood",
    text: "Das Leckeria-Fingerfood ist handlich, vielseitig und immer ein Genuss – von herzhaften Häppchen über kreative Spießchen bis hin zu knackigen Salaten in Gläschen. Ein absolutes Highlight sind die Mini-Burger: kleine Geschmacksexplosionen mit hausgemachten Saucen, karamellisierten Zwiebeln und frischem Gemüse. Vegetarische Optionen sind selbstverständlich ebenfalls erhältlich.",
    icon: "M4 14h16M6 11a6 6 0 0 1 12 0M5 14a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3",
    color: "bg-herb-500/15 text-herb-600",
  },
];

export default function PartyservicePage() {
  return (
    <>
      <section className="grain relative overflow-hidden bg-gradient-to-br from-brand-500 to-brand-600 py-20 text-white">
        <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-gold-400/30 blur-2xl" />
        <Container className="relative max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-gold-400" />
            Partyservice
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl">
            Feiere – wir kümmern uns ums Essen
          </h1>
          <p className="mt-5 text-lg text-white/90">
            Ob Geburtstag, Hochzeit oder Firmenfeier: Leckeria sorgt mit
            frischen Speisen und zuverlässigem Service für rundum zufriedene
            Gäste.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/kontakt" variant="light">
              Unverbindlich anfragen
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading
            center
            eyebrow="Unsere Pakete"
            title="Für jeden Anlass das Richtige"
            intro="Alle Pakete passen wir individuell an Personenzahl, Wünsche und Budget an."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PACKAGES.map((p) => (
              <div
                key={p.name}
                className="group rounded-3xl border border-sand-200 bg-white p-7 transition hover:-translate-y-1.5 hover:shadow-warm"
              >
                <span className={`grid h-14 w-14 place-items-center rounded-2xl ${p.color}`}>
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d={p.icon} />
                  </svg>
                </span>
                <h3 className="mt-5 text-xl text-ink">{p.name}</h3>
                <p className="mt-2 text-ink-soft">{p.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-sand-100 py-16">
        <Container className="flex flex-col items-center gap-10 text-center">
          <SectionHeading
            center
            title="So einfach geht's"
          />
          <div className="relative w-full">
            {/* Strahl / Verbindungslinie von links nach rechts */}
            <div className="pointer-events-none absolute left-[16.666%] right-[16.666%] top-8 hidden h-1 rounded-full bg-gradient-to-r from-brand-300 via-brand-500 to-brand-700 sm:block" />
            <ol className="relative grid gap-10 sm:grid-cols-3">
              {[
                ["1", "Anfragen", "Schildere uns Anlass, Datum und Gästezahl."],
                ["2", "Angebot", "Wir erstellen ein individuelles, transparentes Angebot."],
                ["3", "Genießen", "Wir liefern pünktlich – du feierst entspannt."],
              ].map(([num, title, text]) => (
                <li key={num} className="group flex flex-col items-center text-center">
                  <span className="relative z-10 grid h-16 w-16 place-items-center rounded-full bg-brand-500 text-xl font-extrabold text-sand-50 shadow-warm ring-8 ring-sand-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:bg-brand-600">
                    {num}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-ink transition-colors group-hover:text-brand-600">
                    {title}
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-ink-soft">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-ink-soft">Bereit für deine Feier? Wir beraten dich gern.</p>
            <ButtonLink href="/kontakt">Unverbindlich anfragen</ButtonLink>
          </div>
        </Container>
      </section>

      {/* Galerie: Catering & Partyservice */}
      <section className="py-20">
        <Container>
          <SectionHeading
            eyebrow="Galerie"
            title="Eindrücke aus unserem Catering"
            intro="Ein kleiner Vorgeschmack auf unsere Buffets, Platten und Veranstaltungen."
          />
          <div className="mt-10">
            <ImageGallery images={CATERING_IMAGES} label="Catering" />
          </div>
        </Container>
      </section>
    </>
  );
}
