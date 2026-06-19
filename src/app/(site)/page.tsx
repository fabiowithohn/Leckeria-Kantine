import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Container, SectionHeading, ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";

const SERVICES = [
  {
    title: "Catering & Partyservice",
    text: "Vom Business-Lunch über Buffets und Fingerfood bis zum großen Event – frisch zubereitet, individuell und pünktlich geliefert.",
    href: "/partyservice",
    icon: "M3 11h18M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M4 11l1 9h14l1-9",
    color: "bg-brand-50 text-brand-600",
  },
  {
    title: "Kantinenservice",
    text: "Täglich abwechslungsreiche Verpflegung für Unternehmen – inkl. Online-Bestellung.",
    href: "/kantine",
    icon: "M4 4h16v6a8 8 0 0 1-16 0V4zM2 21h20",
    color: "bg-herb-500/15 text-herb-600",
  },
];

export default async function HomePage() {
  const news = await prisma.newsPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 2,
    select: {
      id: true,
      title: true,
      body: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
  const newsImaged = await prisma.newsPost.findMany({
    where: { published: true, NOT: { imageData: null } },
    select: { id: true },
  });
  const newsWithImage = new Set(newsImaged.map((p) => p.id));

  return (
    <>
      {/* Hero */}
      <section className="grain relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-500 to-brand-600 text-white">
        {/* dezenter dekorativer Lichtschein oben (sauber innerhalb des Bereichs) */}
        <div className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-gold-400/25 blur-3xl" />

        <Container className="relative grid items-center gap-12 pb-28 pt-20 lg:grid-cols-2 lg:pb-32 lg:pt-28">
          <div className="flex flex-col">
            <span className="animate-rise mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-gold-400" />
              Catering & Kantinenservice · Hessen
            </span>
            <h1 className="animate-rise text-5xl leading-[0.95] sm:text-6xl lg:text-7xl" style={{ animationDelay: "0.08s" }}>
              Frisch gekocht.
              <br />
              <span className="text-gold-400">Regional</span> serviert.
            </h1>
            <p className="animate-rise mt-6 max-w-xl text-lg text-white/90" style={{ animationDelay: "0.16s" }}>
              Wir bei Leckeria versorgen deine Feier mit leckerem Essen und
              Fingerfood. Frisch, herzlich und persönlich. Neben unserem
              Partyservice bieten wir auch Kantinenservice an und kümmern uns mit
              viel Leidenschaft darum, dass sich jeder gut versorgt fühlt.
            </p>
            <div className="animate-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.24s" }}>
              <ButtonLink href="/kontakt" variant="light">
                Jetzt anfragen
              </ButtonLink>
              <Link
                href="/speisekarte"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/70 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/15"
              >
                Speiseplan öffentliche Kantine
              </Link>
            </div>
          </div>

          {/* Icon-Logo in weichem Blob */}
          <div className="animate-rise relative mx-auto flex max-w-sm items-center justify-center" style={{ animationDelay: "0.2s" }}>
            <div className="blob absolute inset-0 scale-110 bg-white/15" />
            <div className="blob relative grid w-full place-items-center bg-sand-50 px-14 pt-12 pb-16 shadow-warm-lg">
              <Image
                src="/brand/icon-color-trim.png"
                alt="Leckeria – bunte Vielfalt aus frischen Zutaten"
                width={1660}
                height={2207}
                priority
                className="h-auto w-44 drop-shadow-sm"
              />
            </div>
            <span className="absolute -right-2 top-6 h-10 w-10 rounded-full bg-herb-500 shadow-warm" />
            <span className="absolute -left-3 bottom-10 h-7 w-7 rounded-full bg-gold-400 shadow-warm" />
          </div>
        </Container>
        {/* saubere Wellenkante zum hellen Bereich darunter */}
        <svg
          className="absolute inset-x-0 bottom-0 block w-full"
          style={{ height: "clamp(40px, 6vw, 90px)" }}
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,90 L0,40 C240,80 480,80 720,52 C960,24 1200,24 1440,48 L1440,90 Z"
            fill="#fffaf4"
          />
        </svg>
      </section>

      {/* Imagevideo */}
      <section className="py-20">
        <Container>
          <SectionHeading
            center
            eyebrow="Leckeria bewegt"
            title="Das ist Leckeria"
            intro="Ein Blick hinter die Kulissen: frische Zutaten, ehrliches Handwerk und ein Team voller Leidenschaft."
          />
          <div className="mx-auto mt-12 max-w-4xl">
            <div className="relative aspect-video overflow-hidden rounded-3xl border border-sand-200 bg-ink shadow-warm">
              {/*
                PLATZHALTER für das Imagevideo.
                Sobald das Video bei YouTube/Vimeo liegt, diesen Block durch den
                Embed-Code ersetzen, z. B.:

                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/VIDEO_ID"
                  title="Leckeria Imagevideo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center text-sand-50">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-white/15 backdrop-blur transition group-hover:bg-white/25">
                  <svg viewBox="0 0 24 24" className="h-9 w-9 translate-x-0.5" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <p className="text-lg font-extrabold">Imagevideo folgt in Kürze</p>
                <p className="max-w-md px-6 text-sm text-sand-200/80">
                  Hier wird das eingebettete YouTube- bzw. Vimeo-Video erscheinen.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Leistungen */}
      <section className="py-20">
        <Container>
          <SectionHeading
            center
            eyebrow="Unsere Leistungen"
            title="Was wir für dich kochen"
            intro="Zwei Bereiche, ein Anspruch: beste Zutaten, ehrliches Handwerk und pünktliche Lieferung."
          />
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            {SERVICES.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="group rounded-3xl border border-sand-200 bg-white p-7 transition hover:-translate-y-1.5 hover:shadow-warm"
              >
                <span className={`grid h-14 w-14 place-items-center rounded-2xl ${s.color}`}>
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon} />
                  </svg>
                </span>
                <h3 className="mt-5 text-xl text-ink">{s.title}</h3>
                <p className="mt-2 text-ink-soft">{s.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold text-brand-500">
                  Mehr erfahren
                  <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Aktuelles */}
      {news.length > 0 && (
        <section className="py-20">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Neuigkeiten" title="Aktuelles" />
              <ButtonLink href="/aktuelles" variant="ghost">
                Alle Beiträge
              </ButtonLink>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {news.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-3xl border border-sand-200 bg-white transition hover:shadow-warm">
                  {newsWithImage.has(post.id) && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`/api/news-image/${post.id}?v=${post.updatedAt.getTime()}`}
                      alt={post.title}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <div className="p-7">
                    <p className="text-sm font-bold text-brand-500">
                      {post.publishedAt.toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <h3 className="mt-2 text-xl text-ink">{post.title}</h3>
                    <p className="mt-2 text-ink-soft">{post.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="pb-20">
        <Container>
          <div className="grain relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-8 py-14 text-center text-white shadow-warm-lg">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/30 blur-2xl" />
            <h2 className="relative text-3xl sm:text-4xl">
              Plane dein nächstes Event mit uns
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/90">
              Ob Tagung, Hochzeit oder Betriebsfeier – wir erstellen dir ein
              individuelles Angebot.
            </p>
            <div className="relative mt-7 flex justify-center">
              <ButtonLink href="/kontakt" variant="light">
                Kontakt aufnehmen
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
