"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string; exact?: boolean };
type NavGroup = { group: string; links: NavLink[] };
type NavItem = NavLink | NavGroup;

const ITEMS: NavItem[] = [
  { href: "/admin", label: "Übersicht", exact: true },
  {
    group: "Grenzebach",
    links: [
      { href: "/admin/grenzebach", label: "Gerichte" },
      { href: "/admin/benutzer", label: "Mitarbeitende" },
      { href: "/admin/bestellungen", label: "Bestellungen" },
    ],
  },
  { href: "/admin/speisekarte", label: "Asteel Flash" },
  { href: "/admin/aktuelles", label: "Aktuelles" },
];

export function AdminNav() {
  const pathname = usePathname();
  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  function linkClass(href: string, exact?: boolean) {
    return `block rounded-xl px-4 py-2.5 text-sm font-medium transition ${
      active(href, exact)
        ? "bg-brand-700 text-sand-50"
        : "text-sand-100 hover:bg-brand-700/50"
    }`;
  }

  return (
    <nav className="space-y-1">
      {ITEMS.map((item) =>
        "group" in item ? (
          <div key={item.group} className="pt-2">
            <p className="px-4 pb-1 text-xs font-bold uppercase tracking-wider text-sand-200/70">
              {item.group}
            </p>
            <div className="space-y-1 border-l border-brand-700/60 pl-2">
              {item.links.map((l) => (
                <Link key={l.href} href={l.href} className={linkClass(l.href, l.exact)}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <Link key={item.href} href={item.href} className={linkClass(item.href, item.exact)}>
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
