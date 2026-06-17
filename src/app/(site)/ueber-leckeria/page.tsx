import Image from "next/image";
import { Container, SectionHeading, ButtonLink } from "@/components/ui";

export const metadata = { title: "Über Leckeria" };

export default function UeberLeckeriaPage() {
  return (
    <>
      {/* Hero */}
      <section className="grain relative overflow-hidden bg-gradient-to-br from-brand-500 to-brand-600 py-20 text-white">
        <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-gold-400/30 blur-2xl" />
        <Container className="relative max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-gold-400" />
            Über uns
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl">Über Leckeria</h1>
          <p className="mt-5 text-lg text-white/90">
            Frisch, regional und mit Herz – lerne die Menschen und die
            Philosophie hinter Leckeria kennen.
          </p>
        </Container>
      </section>

      {/* Geschäftsführerin */}
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Über uns" title="Unsere Geschäftsführerin" />

          <div className="mt-12 grid items-stretch gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-14">
            <div className="relative mx-auto aspect-[697/835] w-full max-w-sm overflow-hidden rounded-3xl ring-1 ring-sand-200 lg:mx-0 lg:aspect-auto lg:h-full lg:max-w-none">
              <Image
                src="/team/antje.jpg"
                alt="Antje, Geschäftsführerin von Leckeria"
                fill
                sizes="(max-width: 1024px) 24rem, 22rem"
                className="object-cover"
                priority
              />
            </div>

            <div>
              <h3 className="text-2xl text-ink sm:text-3xl">
                Antje, das Herz von Leckeria
              </h3>
              <div className="mt-5 space-y-5 text-lg leading-relaxed text-ink-soft">
                <p>
                  Antje ist das Gesicht hinter Leckeria. Mit 34 Jahren lebt sie
                  gemeinsam mit ihrem vierjährigen Sohn in der Nähe von Bad
                  Hersfeld.
                </p>
                <p>
                  Ihre Liebe zur Küche begann früh: Schon mit 17 stand sie im
                  Familienbetrieb und merkte schnell, dass gutes Essen ihre
                  Leidenschaft ist. Nach ihrer Ausbildung zur Fleischerin
                  sammelte sie wertvolle Erfahrungen an der Seite verschiedener
                  Köche und vertiefte ihr Wissen über frische Zutaten und
                  kreative Gerichte.
                </p>
                <p>
                  2018 übernahm sie gemeinsam mit ihrer Schwester Kathrin die
                  Firma, baute den Partyservice aus und erweiterte das Angebot um
                  eine zusätzliche Kantine. Seit 2023 leitet Antje das
                  Unternehmen allein. Dabei liegt ihr besonders am Herzen, mit
                  lokalen Partnern zusammenzuarbeiten: Fleisch von der Fleischerei
                  Jillek, die auf Tierwohl setzt, Brötchen von der Bäckerei Nolte
                  und Burger Buns von der regionalen Bäckerei Riesen Friesen sind
                  feste Bestandteile ihrer Philosophie.
                </p>
                <p>
                  Antje schafft es, Regionalität, Qualität und persönliches
                  Engagement in jedes Gericht einfließen zu lassen – für ein
                  Leckeria-Erlebnis, das in Erinnerung bleibt.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Unsere Philosophie */}
      <section className="bg-sand-100/60 py-20">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Unsere Philosophie" title="Mehr als ein Partyservice" />
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink-soft">
            <p>
              Wir bei Leckeria sind mehr als ein Partyservice – wir sind deine
              Partner, wenn es darum geht, gutes Essen in den Mittelpunkt zu
              stellen. Mit viel Herzblut, einer Leidenschaft für Qualität und
              einem klaren Fokus auf frische Zutaten gestalten wir einzigartige
              kulinarische Erlebnisse.
            </p>
            <p>
              Heute sind wir ein großes Team von wachsender Mitarbeiterzahl,
              betreiben 3 Kantinen im Raum Bad Hersfeld und bieten einen
              vielseitigen Partyservice. Zudem versorgen wir seit 2020 auch
              verschiedene Betriebe mit leckeren Snacks über unsere
              Brötchenautomaten – eine Idee, die während der Corona-Zeit
              entstanden ist.
            </p>
            <p>
              Qualität ist für uns kein Kompromiss, sondern unser Anspruch. Unser
              Fleisch beziehen wir von der Fleischerei Jillek, die auf Tierwohl
              setzt: eigene Schweine, kein Tiertransport, selbst hergestelltes
              Futter. Unser Brot und Gebäck kommen aus der Bäckerei Nolte, während
              die Brötchen für unsere beliebten Burger Buns von der regionalen
              Bäckerei Riesen Friesen stammen.
            </p>
            <p>
              Ob in unseren Kantinen, für dein Event oder mit unseren Automaten
              für eure Firma – bei Leckeria sorgen wir dafür, dass du den
              Unterschied schmeckst. Denn gutes Essen ist für uns nicht nur
              Arbeit, sondern echte Leidenschaft.
            </p>
          </div>

          <div className="mt-10">
            <ButtonLink href="/kontakt">Lerne uns kennen</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
