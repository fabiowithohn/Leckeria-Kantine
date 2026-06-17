/** Cent-Betrag als "4,50 €" formatieren. Null/undefined → leerer String. */
export function formatPrice(cents: number | null | undefined): string {
  if (cents == null) return "";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/** Eingabe wie "4,50" oder "4.50" in Cent umwandeln. Leer → null. */
export function parsePriceToCents(input: string | null | undefined): number | null {
  if (input == null) return null;
  const trimmed = input.trim();
  if (trimmed === "") return null;
  const normalized = trimmed.replace(/\s|€/g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);
  if (Number.isNaN(value)) return null;
  return Math.round(value * 100);
}
