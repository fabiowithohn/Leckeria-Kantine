import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import sharp from "sharp";

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

async function compress(buf: Buffer): Promise<Uint8Array<ArrayBuffer>> {
  const out = await sharp(buf)
    .rotate()
    .resize({ width: 900, withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
  const u8 = new Uint8Array(out.length);
  u8.set(out);
  return u8;
}

async function main() {
  console.log("🌱 Seede Datenbank …");

  // Hinweis: Es werden bewusst KEINE Demo-Gerichte mehr angelegt. Die
  // Gericht-Bibliothek (Dish) wird ausschließlich über das Admin-Backend
  // gepflegt und vom Seed nicht angefasst.

  // ---- Asteel Flash: Wochenplan-Bild aus dem Ordner "speisepläne" ----
  const planDir = path.join(process.cwd(), "speisepläne");
  let planImage: Uint8Array<ArrayBuffer> | null = null;
  if (fs.existsSync(planDir)) {
    const file = fs.readdirSync(planDir).find((f) => /\.(png|jpe?g|webp)$/i.test(f));
    if (file) planImage = await compress(fs.readFileSync(path.join(planDir, file)));
  }
  await prisma.weeklyPlan.upsert({
    where: { id: "asteel-flash" },
    update: planImage
      ? { imageData: planImage, imageMime: "image/jpeg", title: "vom 01.06. – 05.06.26" }
      : {},
    create: {
      id: "asteel-flash",
      title: "vom 01.06. – 05.06.26",
      ...(planImage ? { imageData: planImage, imageMime: "image/jpeg" } : {}),
    },
  });
  if (planImage) console.log("🗓  Asteel-Flash-Wochenplan geladen.");

  // ---- Aktuelles ----
  await prisma.newsPost.deleteMany();
  await prisma.newsPost.create({
    data: {
      title: "Neue Sommerkarte ist da",
      body: "Ab sofort verwöhnen wir Sie mit leichten, regionalen Sommergerichten – frisch aus Hessen.",
    },
  });
  await prisma.newsPost.create({
    data: {
      title: "Catering für Ihre Firmenfeier",
      body: "Planen Sie eine Veranstaltung? Unser Partyservice stellt Ihnen ein individuelles Buffet zusammen.",
    },
  });

  // ---- Demo-Mitarbeiter (bereits bestätigt, für schnellen Login-Test) ----
  const demoEmail = "demo@grenzebach.test";
  await prisma.user.upsert({
    where: { email: demoEmail },
    update: { approved: true },
    create: {
      email: demoEmail,
      name: "Demo Mitarbeiter",
      firstName: "Demo",
      lastName: "Mitarbeiter",
      passwordHash: await bcrypt.hash("test1234", 10),
      emailVerified: new Date(),
      approved: true,
    },
  });

  console.log("✅ Seed abgeschlossen. Demo-Login: demo@grenzebach.test / test1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
