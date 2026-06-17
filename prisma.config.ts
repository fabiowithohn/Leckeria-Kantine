import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7: Verbindungs-URL & Migrations-Konfiguration leben hier
// (nicht mehr im schema.prisma). Funktioniert lokal (embedded-postgres)
// wie auch in Produktion (Neon) – jeweils über DATABASE_URL.
//
// Hinweis: Wir lesen DATABASE_URL bewusst optional aus process.env (statt über
// env("…"), das beim Fehlen sofort wirft). So funktioniert `prisma generate`
// während des Builds auch ohne gesetzte DATABASE_URL (Generate braucht keine
// DB-Verbindung). Migrationen/Studio nutzen die real gesetzte Variable.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
