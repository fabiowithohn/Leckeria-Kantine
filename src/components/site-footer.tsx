import Link from "next/link";
import { Logo } from "./logo";
import { CookieSettingsLink } from "./cookie-consent";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-sand-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo variant="white" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-sand-200/80">
            Catering, Partyservice & Kantinenverpflegung aus der Region Hessen –
            frisch, regional und mit Liebe gekocht.
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href="https://www.instagram.com/leckeria_partyservice/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Leckeria auf Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sand-100 transition hover:bg-brand-500 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5.5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/p/Leckeria-100057474098258/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Leckeria auf Facebook"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sand-100 transition hover:bg-brand-500 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-brand-400">
            Seiten
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/ueber-leckeria" className="text-sand-200/80 transition hover:text-white">Über Leckeria</Link></li>
            <li><Link href="/aktuelles" className="text-sand-200/80 transition hover:text-white">Aktuelles</Link></li>
            <li><Link href="/speisekarte" className="text-sand-200/80 transition hover:text-white">Asteel Flash</Link></li>
            <li><Link href="/partyservice" className="text-sand-200/80 transition hover:text-white">Partyservice</Link></li>
            <li><Link href="/kantine" className="text-sand-200/80 transition hover:text-white">Kantine</Link></li>
            <li><Link href="/fuer-firmen" className="text-sand-200/80 transition hover:text-white">Für Firmen</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-brand-400">
            Bereiche
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/grenzebach" className="text-sand-200/80 transition hover:text-white">Kantine Grenzebach</Link></li>
            <li><Link href="/kontakt" className="text-sand-200/80 transition hover:text-white">Kontakt</Link></li>
            <li><Link href="/admin/login" className="text-sand-200/80 transition hover:text-white">Verwaltung</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-brand-400">
            Rechtliches
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/agb" className="text-sand-200/80 transition hover:text-white">AGB</Link></li>
            <li><Link href="/impressum" className="text-sand-200/80 transition hover:text-white">Impressum</Link></li>
            <li><Link href="/datenschutz" className="text-sand-200/80 transition hover:text-white">Datenschutz</Link></li>
            <li><Link href="/cookies" className="text-sand-200/80 transition hover:text-white">Cookies</Link></li>
            <li><CookieSettingsLink className="text-sand-200/80 transition hover:text-white" /></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-extrabold uppercase tracking-wider text-brand-400">
            Kontakt
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-sand-200/80">
            <li>Leckeria – Kantinen- und Partyservice</li>
            <li>Rudolf-Grenzebach-Straße 1</li>
            <li>36251 Bad Hersfeld</li>
            <li>info@leckeria-kantine.de</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-sand-200/70">
        © {new Date().getFullYear()} Leckeria – Kantinen- &amp; Partyservice
      </div>
    </footer>
  );
}
