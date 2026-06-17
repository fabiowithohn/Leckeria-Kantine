import Link from "next/link";
import { Container, SectionHeading, Badge } from "@/components/ui";
import { ImageGallery } from "@/components/ui/image-gallery";
import { KANTINE_IMAGES } from "@/lib/gallery-data";

export const metadata = { title: "Kantine" };

const CANTEENS = [
  {
    name: "Asteel Flash",
    public: true,
    text: "Unsere öffentliche Kantine bei Asteel Flash – täglich frische Mittagsgerichte, auch für Gäste zugänglich.",
    href: "/speisekarte",
    cta: "Zum Wochenplan",
  },
  {
    name: "Libri",
    public: false,
    text: "Betriebskantine für die Mitarbeitenden von Libri. Zugang nur für Beschäftigte.",
  },
  {
    name: "Grenzebach",
    public: false,
    text: "Betriebskantine für die Mitarbeitenden von Grenzebach – mit komfortabler Online-Bestellung der Tagesgerichte.",
    href: "/grenzebach",
    cta: "Zum Bestellbereich",
  },
];

export default function KantinePage() {
  return (
    <>
      <section className="grain relative overflow-hidden bg-gradient-to-br from-brand-500 to-brand-600 py-20 text-white">
        <div className="pointer-events-none absolute -left-20 -top-16 h-64 w-64 rounded-full bg-gold-400/30 blur-2xl" />
        <Container className="relative max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-gold-400" />
            Kantinenservice
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl">
            Mittagessen, das schmeckt
          </h1>
          <p className="mt-5 text-lg text-white/90">
            Leckeria betreibt Betriebskantinen in der Region Hessen – mit
            frischen, wechselnden Gerichten und einer großen Auswahl für jeden
            Geschmack.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading
            center
            eyebrow="Unsere Standorte"
            title="Drei Kantinen, ein Qualitätsanspruch"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {CANTEENS.map((c) => (
              <div
                key={c.name}
                className="flex flex-col rounded-3xl border border-sand-200 bg-white p-7 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-ink">{c.name}</h3>
                  <Badge tone={c.public ? "open" : "closed"}>
                    {c.public ? "Öffentlich" : "Nicht öffentlich"}
                  </Badge>
                </div>
                <p className="mt-3 flex-1 text-ink-soft">{c.text}</p>
                {c.href && (
                  <Link
                    href={c.href}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-600"
                  >
                    {c.cta} <span>→</span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-ink-soft">
            Du möchtest deine Betriebsverpflegung an Leckeria übergeben?{" "}
            <Link href="/kontakt" className="font-semibold text-brand-700 underline">
              Sprich uns an.
            </Link>
          </p>
        </Container>
      </section>

      {/* Galerie: Kantine */}
      <section className="bg-sand-100 py-20">
        <Container>
          <SectionHeading
            eyebrow="Galerie"
            title="Eindrücke aus unseren Kantinen"
            intro="So sieht frische, abwechslungsreiche Kantinenverpflegung von Leckeria aus."
          />
          <div className="mt-10">
            <ImageGallery images={KANTINE_IMAGES} label="Kantine" />
          </div>
        </Container>
      </section>
    </>
  );
}
