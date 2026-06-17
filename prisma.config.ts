import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7: Verbindungs-URL & Migrations-Konfiguration leben hier
// (nicht mehr im schema.prisma). Funktioniert lokal (embedded-postgres)
// wie auch in Produktion (Neon) – jeweils über DATABASE_URL.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
