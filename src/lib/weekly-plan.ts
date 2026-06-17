import { prisma } from "@/lib/db";

// Fester "Singleton"-Schlüssel für den Asteel-Flash-Wochenplan.
export const ASTEEL_FLASH_PLAN_ID = "asteel-flash";

/** Liefert Metadaten des Wochenplans (ohne die Bilddaten zu laden). */
export async function getPlanMeta(): Promise<{
  hasImage: boolean;
  title: string | null;
  version: string;
} | null> {
  // imageData NICHT mitladen (nur Metadaten)
  const plan = await prisma.weeklyPlan.findUnique({
    where: { id: ASTEEL_FLASH_PLAN_ID },
    select: { title: true, updatedAt: true },
  });
  // separat prüfen, ob ein Bild hinterlegt ist
  const imaged = await prisma.weeklyPlan.findFirst({
    where: { id: ASTEEL_FLASH_PLAN_ID, NOT: { imageData: null } },
    select: { id: true },
  });
  if (!plan) return null;
  return {
    hasImage: imaged != null,
    title: plan.title,
    version: plan.updatedAt.getTime().toString(),
  };
}
