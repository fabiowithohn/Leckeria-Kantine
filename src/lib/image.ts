import sharp from "sharp";

const MAX_WIDTH = 900;
const JPEG_QUALITY = 78;

/**
 * Verarbeitet eine hochgeladene Bilddatei: skaliert auf max. Breite und
 * komprimiert als JPEG. Gibt null zurück, wenn keine (gültige) Datei vorliegt.
 */
export async function processDishImage(
  file: FormDataEntryValue | null,
): Promise<{ data: Uint8Array<ArrayBuffer>; mime: string } | null> {
  if (!file || typeof file === "string") return null;
  // File-Objekt mit Inhalt?
  if (typeof file.arrayBuffer !== "function" || file.size === 0) return null;

  const input = Buffer.from(await file.arrayBuffer());
  const out = await sharp(input)
    .rotate() // EXIF-Ausrichtung berücksichtigen
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  // Prisma `Bytes` erwartet Uint8Array<ArrayBuffer>
  const data = new Uint8Array(out.length);
  data.set(out);
  return { data, mime: "image/jpeg" };
}
