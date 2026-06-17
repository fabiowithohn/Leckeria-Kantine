// Optimiert die Galerie-Bilder aus den Ordnern "bilder_catering" / "bilder_kantine"
// / "brötchenautomat_bilder" nach public/galerie/<cat> und schreibt ein Manifest
// (src + Maße) nach src/lib/gallery-data.ts. Zusätzlich werden einzelne Hero-Bilder
// nach public/<ziel> optimiert. Erneut ausführen, wenn neue Bilder hinzukommen:
//   node scripts/prep-gallery.mjs
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const MAX_WIDTH = 1400;

const sources = [
  { key: "catering", dir: "bilder_catering" },
  { key: "kantine", dir: "bilder_kantine" },
  { key: "firmen", dir: "brötchenautomat_bilder", exclude: ["main.jpg"] },
];

// Einzelne Hero-/Standbilder (kein Galerie-Manifest, fester Dateiname)
const heroes = [
  { src: "brötchenautomat_bilder/main.jpg", out: "public/firmen/main.jpg" },
];

const manifest = {};

for (const { key, dir, exclude = [] } of sources) {
  const srcDir = path.join(root, dir);
  const outDir = path.join(root, "public", "galerie", key);
  fs.mkdirSync(outDir, { recursive: true });
  // alte Ausgabe leeren
  for (const f of fs.existsSync(outDir) ? fs.readdirSync(outDir) : []) {
    fs.rmSync(path.join(outDir, f));
  }

  const files = fs
    .readdirSync(srcDir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .filter((f) => !exclude.includes(f))
    .sort();

  const items = [];
  let i = 0;
  for (const file of files) {
    const buf = fs.readFileSync(path.join(srcDir, file));
    const pipeline = sharp(buf).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true });
    const outName = `${key}-${++i}.jpg`;
    await pipeline.toFile(path.join(outDir, outName));
    const meta = await sharp(path.join(outDir, outName)).metadata();
    items.push({ src: `/galerie/${key}/${outName}`, width: meta.width, height: meta.height });
  }
  manifest[key] = items;
  console.log(`✅ ${key}: ${items.length} Bilder optimiert.`);
}

// Hero-Bilder optimieren
for (const { src, out } of heroes) {
  const outPath = path.join(root, out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(fs.readFileSync(path.join(root, src)))
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outPath);
  console.log(`✅ Hero-Bild: ${out}`);
}

const constName = (key) => `${key.toUpperCase()}_IMAGES`;
const ts =
  "// AUTOMATISCH GENERIERT von scripts/prep-gallery.mjs – nicht von Hand bearbeiten.\n" +
  "export type GalleryImage = { src: string; width: number; height: number };\n\n" +
  sources
    .map(({ key }) => `export const ${constName(key)}: GalleryImage[] = ${JSON.stringify(manifest[key], null, 2)};`)
    .join("\n\n") +
  "\n";

fs.writeFileSync(path.join(root, "src", "lib", "gallery-data.ts"), ts);
console.log("✅ Manifest geschrieben: src/lib/gallery-data.ts");
