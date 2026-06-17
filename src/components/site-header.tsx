"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./logo";

const NAV = [
  { href: "/", label: "Start" },
  { href: "/ueber-leckeria", label: "Über Leckeria" },
  { href: "/partyservice", label: "Partyservice" },
  { href: "/kantine", label: "Kantine" },
  { href: "/fuer-firmen", label: "Für Firmen" },
];

// Grün umrandete "Standort"-Buttons (oben rechts)
const OUTLINE_BUTTONS = [
  { href: "/speisekarte", label: "Asteel Flash" },
  { href: "/grenzebach", label: "Grenzebach" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/80 bg-sand-50/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo priority />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                isActive(item.href)
                  ? "bg-brand-500 text-white shadow-warm"
                  : "text-ink hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {OUTLINE_BUTTONS.map((btn) => (
            <Link
              key={btn.href}
              href={btn.href}
              className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold transition ${
                isActive(btn.href)
                  ? "border-herb-500 bg-herb-500 text-white"
                  : "border-herb-500 text-herb-600 hover:bg-herb-500 hover:text-white"
              }`}
            >
              {btn.label}
            </Link>
          ))}
          <Link
            href="/kontakt"
            className="rounded-full bg-brand-500 px-5 py-2 text-sm font-extrabold text-white shadow-warm transition hover:bg-brand-600"
          >
            Kontakt
          </Link>
        </div>

        <button
          type="button"
          aria-label="Menü öffnen"
          onClick={() => setOpen((v) => !v)}
          className="rounded-2xl p-2 text-ink hover:bg-brand-50 lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-sand-200 bg-sand-50 px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {[...NAV, ...OUTLINE_BUTTONS, { href: "/kontakt", label: "Kontakt" }].map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-bold ${
                    isActive(item.href)
                      ? "bg-brand-500 text-white"
                      : "text-ink hover:bg-brand-50"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
