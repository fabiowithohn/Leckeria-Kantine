import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma-Client mit PostgreSQL-Driver-Adapter (funktioniert lokal & auf Neon).
// Singleton, damit der Dev-Server nicht bei jedem Reload neue Verbindungen öffnet.
const globalForPrisma = globalThis as unknown as {
  prismaClient?: PrismaClient;
};

function getClient(): PrismaClient {
  if (!globalForPrisma.prismaClient) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL ist nicht gesetzt.");
    }
    globalForPrisma.prismaClient = new PrismaClient({
      adapter: new PrismaPg(connectionString),
    });
  }
  return globalForPrisma.prismaClient;
}

// Lazy-Proxy: Der echte Client (und damit die DB-Verbindung) wird erst beim
// ersten Zugriff erzeugt – NICHT beim Import. So benötigt der Build (z. B. das
// "Collecting page data" auf Vercel) keine DATABASE_URL; sie wird nur zur
// Laufzeit beim ersten Query gebraucht.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
