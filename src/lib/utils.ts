type ClassValue = string | number | null | false | undefined | Record<string, boolean>;

/** Kleines clsx-Äquivalent: verbindet Klassen, unterstützt bedingte Objekte. */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string" || typeof input === "number") {
      out.push(String(input));
    } else {
      for (const [key, value] of Object.entries(input)) if (value) out.push(key);
    }
  }
  return out.join(" ");
}
