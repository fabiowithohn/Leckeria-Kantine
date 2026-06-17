// Quelle: allergenliste.md (EU-Verordnung Nr. 1169/2011, LMIV)
// `iconPath` ist jeweils das `d`-Attribut eines SVG-Pfads (viewBox 0 0 24 24,
// als Linien-Icon gerendert über <MarkIcon />).
export type Allergen = { nr: string; name: string; hint: string; iconPath: string };

export const ALLERGENS: Allergen[] = [
  { nr: "1", name: "Glutenhaltiges Getreide", hint: "Weizen, Dinkel, Roggen, Gerste, Hafer oder Hybridstämme davon", iconPath: "M12 21V8 M12 9c-2.2 0-3.8-1.4-3.8-3.4C10.4 5.6 12 7 12 9Z M12 9c2.2 0 3.8-1.4 3.8-3.4C13.6 5.6 12 7 12 9Z M12 14c-2.2 0-3.8-1.4-3.8-3.4C10.4 10.6 12 12 12 14Z M12 14c2.2 0 3.8-1.4 3.8-3.4C13.6 10.6 12 12 12 14Z" },
  { nr: "2", name: "Krebstiere", hint: "und daraus hergestellte Erzeugnisse", iconPath: "M16 7c2.2 4 1 11-5 11a4 4 0 0 1 0-8c2 0 3-1 3-2.4 M16 7l3-1.5 M16 7l1.6 2.8 M8 13h.01 M10 15h.01" },
  { nr: "3", name: "Eier", hint: "und daraus hergestellte Erzeugnisse", iconPath: "M12 3.5c-3.3 0-5.8 4.4-5.8 8.6a5.8 5.8 0 0 0 11.6 0c0-4.2-2.5-8.6-5.8-8.6Z" },
  { nr: "4", name: "Fisch", hint: "und daraus hergestellte Erzeugnisse", iconPath: "M3 12c4-5 9-5 13 0-4 5-9 5-13 0Z M16 12l5-3v6z M7.5 11h.01" },
  { nr: "5", name: "Erdnüsse", hint: "und daraus hergestellte Erzeugnisse", iconPath: "M12 4.2a3.3 3.3 0 0 0-1 6.3 3.3 3.3 0 0 1 0 5.3 3.3 3.3 0 1 0 2 0 3.3 3.3 0 0 1 0-5.3 3.3 3.3 0 0 0-1-6.3Z M9.5 8h.01 M12 14h.01" },
  { nr: "6", name: "Sojabohnen", hint: "und daraus hergestellte Erzeugnisse", iconPath: "M6 16C4 12 5 7 9 6c3-.8 6 1 8 4 M6 16c2 1.5 5 2 8 0 M13.5 10h.01 M11 12h.01 M9 14h.01" },
  { nr: "7", name: "Milchprodukte", hint: "einschließlich Laktose", iconPath: "M8 8h8v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8Z M8 8l1.5-3.5h5L16 8 M10.5 13h3" },
  { nr: "8", name: "Schalenfrüchte", hint: "Mandeln, Pistazien, Hasel-, Wal-, Cashew-, Pecan-, Macadamia-/Queensland- oder Paranüsse", iconPath: "M6 10a6 6 0 0 1 12 0c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1Z M7 11c0 3.3 2.2 6 5 6s5-2.7 5-6 M12 4v2" },
  { nr: "9", name: "Sellerie", hint: "und daraus hergestellte Erzeugnisse", iconPath: "M12 21V9 M12 9c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6Z M9 13c-2.5 0-4.5-2-4.5-4.5C7 8.5 9 10.5 9 13Z" },
  { nr: "10", name: "Senf", hint: "und daraus hergestellte Erzeugnisse", iconPath: "M9 8h6l-.5 11a1.5 1.5 0 0 1-1.5 1.4h-2A1.5 1.5 0 0 1 9.5 19L9 8Z M10 8V5.5C10 4.7 10.7 4 11.5 4h1c.8 0 1.5.7 1.5 1.5V8 M12 4V2.5" },
  { nr: "11", name: "Sesamsamen", hint: "und daraus hergestellte Erzeugnisse", iconPath: "M12 4c1.5 1.5 1.5 4 0 5.5C10.5 8 10.5 5.5 12 4Z M7 12c1.5 1.5 1.5 4 0 5.5C5.5 16 5.5 13.5 7 12Z M17 12c1.5 1.5 1.5 4 0 5.5C15.5 16 15.5 13.5 17 12Z" },
  { nr: "12", name: "Sulfite / Schwefeldioxid", hint: "in einer Konzentration von mehr als 10 mg/kg oder 10 mg/l", iconPath: "M8 3h8l-1 6a3 3 0 0 1-6 0L8 3Z M12 12v7 M9 21h6" },
  { nr: "13", name: "Lupine", hint: "und daraus hergestellte Erzeugnisse", iconPath: "M12 21v-8 M12 13c0-3-2.5-5-5.5-5 0 3 2.5 5 5.5 5Z M12 11c0-3 2.5-5 5.5-5 0 3-2.5 5-5.5 5Z" },
  { nr: "14", name: "Weichtiere", hint: "z. B. Tintenfisch, Muscheln, Schnecken", iconPath: "M11 13a2 2 0 1 0 2 2 4 4 0 1 0-4-4 6 6 0 1 0 6 6" },
];

export const ALLERGEN_BY_NR: Record<string, Allergen> = Object.fromEntries(
  ALLERGENS.map((a) => [a.nr, a]),
);

/** Gibt zu einer Liste von Nummern die Allergen-Objekte in fester Reihenfolge (1–14) zurück. */
export function allergensByNrs(nrs: string[]): Allergen[] {
  const set = new Set(nrs);
  return ALLERGENS.filter((a) => set.has(a.nr));
}

// Quelle: kennzeichnungspflichtige_zusatzstoffe.md (ZZulV, EU-Verordnung Nr. 1333/2008)
export type Additive = { code: string; category: string; note: string; iconPath: string };

export const ADDITIVES: Additive[] = [
  { code: "a", category: "Farbstoffe", note: "E 100 – E 180 (auch Beta-Carotin und Riboflavin)", iconPath: "M12 3a9 9 0 0 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-.9-.5-1.2-.3-.4-.5-.8-.5-1.3 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7Z M8 11h.01 M10 8h.01 M14 8h.01 M16 11h.01" },
  { code: "b", category: "Farbstoffe mit Warnhinweis", note: "E 102, E 104, E 110, E 122, E 124, E 129", iconPath: "M12 4 2.6 20h18.8L12 4Z M12 10v4 M12 17h.01" },
  { code: "c", category: "Konservierungsstoffe", note: "E 200 – E 219, E 230 – E 235, E 239, E 249 – E 252, E 280 – E 285, E 1105", iconPath: "M6 7h12v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z M6 7c0-1.1 2.7-2 6-2s6 .9 6 2 M9 11h6" },
  { code: "d", category: "Nitritpökelsalz", note: "bei Verwendung von E 249 – E 252 oder Gemischen", iconPath: "M8 9h8l-.7 10a1.5 1.5 0 0 1-1.5 1.4h-3.6A1.5 1.5 0 0 1 8.7 19L8 9Z M9 9V7a3 3 0 0 1 6 0v2 M11 5.5h.01 M13 5.5h.01" },
  { code: "e", category: "Antioxidationsmittel", note: "E 300 – E 321", iconPath: "M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z M9 12l2 2 4-4" },
  { code: "f", category: "Geschmacksverstärker", note: "E 620 – E 635", iconPath: "M12 3v3 M12 18v3 M3 12h3 M18 12h3 M6 6l2 2 M16 16l2 2 M18 6l-2 2 M8 16l-2 2 M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" },
  { code: "g", category: "Schwefeldioxid / Sulfite", note: "E 220 – E 228", iconPath: "M8 3h8l-1 6a3 3 0 0 1-6 0L8 3Z M12 12v7 M9 21h6" },
  { code: "h", category: "Eisensalze", note: "E 579, E 585", iconPath: "M7 4H4v7a8 8 0 0 0 16 0V4h-3v7a5 5 0 0 1-10 0V4Z M4 8h3 M17 8h3" },
  { code: "i", category: "Stoffe zur Oberflächenbehandlung", note: "E 901 – E 904, E 912, E 914", iconPath: "M11 4l1.5 4L17 9.5 12.5 11 11 15l-1.5-4L5 9.5 9.5 8 11 4Z M18 14l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7Z" },
  { code: "j", category: "Süßstoffe", note: "E 950 – E 952, E 954, E 957, E 959, E 960", iconPath: "M9 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z M9 12 5.5 10v4L9 12 M15 12l3.5-2v4L15 12" },
  { code: "k", category: "Andere Süßungsmittel / Zuckeralkohole", note: "E 420, E 421, E 953, E 965 – E 968", iconPath: "M11 10a4.5 4.5 0 1 0 0 .01 M11 14.5V20 M11 20h3 M9 8.5c.6-1 2.4-1 3 0" },
  { code: "l", category: "Phosphate (Stabilisator)", note: "E 338 – E 341, E 450 – E 452", iconPath: "M9 3h6 M10 3v6l-4.5 8a1.5 1.5 0 0 0 1.3 2.3h10.4a1.5 1.5 0 0 0 1.3-2.3L14 9V3 M8 15h8" },
  { code: "m", category: "Chinin, Chininsalze", note: "kein Klassenname, keine E-Nummer", iconPath: "M10.5 3.5 3.5 10.5a4.95 4.95 0 0 0 7 7l7-7a4.95 4.95 0 0 0-7-7Z M7 7l7 7" },
];

export const ADDITIVE_BY_CODE: Record<string, Additive> = Object.fromEntries(
  ADDITIVES.map((a) => [a.code, a]),
);

/** Gibt zu einer Liste von Kürzeln die Zusatzstoff-Objekte in fester Reihenfolge (a–m) zurück. */
export function additivesByCodes(codes: string[]): Additive[] {
  const set = new Set(codes);
  return ADDITIVES.filter((a) => set.has(a.code));
}
