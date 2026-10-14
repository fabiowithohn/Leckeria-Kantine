import type { Category } from "./meal-plan";

/**
 * Linien-Icons der Kategorien auf dem Speiseplan (viewBox 0 0 24 24, Strich).
 * Werden sowohl im Backend (Auswahl) als auch im gerenderten Plan benutzt.
 */
export const CATEGORY_ICON_PATHS: Record<Category, string> = {
  // Rind: Kopf mit Hörnern, Ohren und Maul
  rind: "M8 5c-1.5 0-3-1-3.5-2.5M16 5c1.5 0 3-1 3.5-2.5M8 5a4 4 0 0 1 8 0M8 5c-2.2 0-3.5 1.6-3.5 3.5S5.6 12 7 12M16 5c2.2 0 3.5 1.6 3.5 3.5S18.4 12 17 12M7 12v3c0 3.3 2.2 5.5 5 5.5s5-2.2 5-5.5v-3M9.5 11h.01M14.5 11h.01M9.5 16.5h5M10 18.5h.01M14 18.5h.01",
  // Huhn: Körper mit Kamm, Schnabel und Schwanzfeder
  huhn: "M9 4c0-1 .7-1.8 1.5-1.8S12 3 12 4c0-1 .7-1.8 1.5-1.8S15 3 15 4M12 4c-2.5 0-4 1.8-4 4v1.5c-2.5.5-4.5 2.5-4.5 5.5 0 3.5 3 6 7 6s7-2.5 7-6V9.5M12 4c1.7 0 3 1.1 3.3 2.5M15 7l3 .8-2.6 1.4M20.5 10.5c.5 1.5.3 3-.5 4M9.6 7.4h.01",
  // Schwein: Kopf mit Ohren und Rüssel
  schwein: "M6 9 3.5 5.5 8 6M18 9l2.5-3.5L16 6M6 9a6.5 6.5 0 0 1 12 0v4.5a6 6 0 0 1-12 0V9ZM9 11h.01M15 11h.01M9.5 15.5a2.5 2 0 1 0 5 0 2.5 2 0 1 0-5 0M11 15.5h.01M13 15.5h.01",
  // Fisch: Körper, Schwanzflosse, Auge
  fisch: "M3 12c2.5-4.5 7-6.5 11-5.5 1.5 1.5 2.5 3.5 2.5 5.5s-1 4-2.5 5.5c-4 1-8.5-1-11-5.5ZM14 6.5l6.5-3.5-1.5 9 1.5 9L14 17.5M6.5 11h.01M9 9.5c.5 2 .5 3 0 5",
  // Vegetarisch: Blatt mit Mittelrippe
  veg: "M5 19c0-8 5-14 15-15-.5 10-6 15-14 15M5 19l9-9",
};
