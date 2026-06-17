// Überträgt die lokal eingegebenen Daten (Gerichte inkl. Bilder/Allergene,
// Zuordnungen, News, Wochenplan, öffentliche Speisekarte, Nutzerkonten) aus der
// lokalen Entwicklungs-DB in die Produktions-Datenbank (Neon).
//
// Aufruf:
//   PROD_DATABASE_URL="postgresql://…neon…" npx tsx scripts/migrate-to-prod.ts
//
// Voraussetzung: In der Ziel-DB wurde zuvor `prisma migrate deploy` ausgeführt
// (Tabellen müssen existieren). Mehrfaches Ausführen ist sicher (skipDuplicates).
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const SRC = process.env.DATABASE_URL;
  const DST = process.env.PROD_DATABASE_URL;
  if (!SRC) throw new Error("DATABASE_URL (Quelle) fehlt.");
  if (!DST) throw new Error("PROD_DATABASE_URL (Ziel) fehlt – bitte die Neon-URL setzen.");
  if (SRC === DST) throw new Error("Quelle und Ziel sind identisch – abgebrochen.");

  const source = new PrismaClient({ adapter: new PrismaPg(SRC) });
  const target = new PrismaClient({ adapter: new PrismaPg(DST) });

  // Reihenfolge wegen Fremdschlüsseln: erst Basistabellen, dann Zuordnungen.
  const users = await source.user.findMany();
  await target.user.createMany({ data: users, skipDuplicates: true });
  console.log(`Nutzer:            ${users.length}`);

  const dishes = await source.dish.findMany();
  await target.dish.createMany({ data: dishes, skipDuplicates: true });
  console.log(`Gerichte:          ${dishes.length}`);

  const assignments = await source.menuAssignment.findMany();
  await target.menuAssignment.createMany({ data: assignments, skipDuplicates: true });
  console.log(`Zuordnungen:       ${assignments.length}`);

  const news = await source.newsPost.findMany();
  await target.newsPost.createMany({ data: news, skipDuplicates: true });
  console.log(`News-Beiträge:     ${news.length}`);

  const menuItems = await source.menuItem.findMany();
  await target.menuItem.createMany({ data: menuItems, skipDuplicates: true });
  console.log(`Speisekarte:       ${menuItems.length}`);

  const plans = await source.weeklyPlan.findMany();
  for (const p of plans) {
    await target.weeklyPlan.upsert({ where: { id: p.id }, update: p, create: p });
  }
  console.log(`Wochenpläne:       ${plans.length}`);

  console.log("\n✅ Datenübertragung abgeschlossen.");
  await source.$disconnect();
  await target.$disconnect();
}

main().catch((e) => {
  console.error("❌ FEHLER:", e?.message ?? e);
  process.exit(1);
});
