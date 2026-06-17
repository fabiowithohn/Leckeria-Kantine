// Startet eine lokale PostgreSQL-Instanz (embedded-postgres) für die Entwicklung.
// Keine System-Installation nötig. In Produktion (Neon) wird dieses Skript NICHT
// gebraucht – dort setzt man einfach DATABASE_URL auf die Neon-Verbindung.
//
// Nutzung:  node scripts/local-db.mjs      (läuft, bis man Strg+C drückt)
import EmbeddedPostgres from "embedded-postgres";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", ".localdb");
const PORT = 5433;
const DB_NAME = "leckeria";

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

const alreadyInitialised = fs.existsSync(path.join(dataDir, "PG_VERSION"));

if (!alreadyInitialised) {
  console.log("⏳ Initialisiere lokale Datenbank …");
  await pg.initialise();
}

await pg.start();
console.log(`✅ PostgreSQL läuft auf localhost:${PORT}`);

try {
  await pg.createDatabase(DB_NAME);
  console.log(`✅ Datenbank "${DB_NAME}" erstellt.`);
} catch {
  console.log(`ℹ️  Datenbank "${DB_NAME}" existiert bereits.`);
}

console.log(
  `\nDATABASE_URL="postgresql://postgres:postgres@localhost:${PORT}/${DB_NAME}?schema=public"\n` +
    "→ Lass dieses Fenster offen und starte in einem zweiten Terminal: npm run dev\n" +
    "→ Beenden mit Strg+C",
);

async function shutdown() {
  console.log("\n⏹  Stoppe PostgreSQL …");
  try {
    await pg.stop();
  } catch {}
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
