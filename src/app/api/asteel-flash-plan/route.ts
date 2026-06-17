import { prisma } from "@/lib/db";
import { ASTEEL_FLASH_PLAN_ID } from "@/lib/weekly-plan";

export const dynamic = "force-dynamic";

// Liefert das aktuelle Wochenplan-Bild der Kantine Asteel Flash.
export async function GET() {
  const plan = await prisma.weeklyPlan.findUnique({
    where: { id: ASTEEL_FLASH_PLAN_ID },
    select: { imageData: true, imageMime: true },
  });

  if (!plan?.imageData) {
    return new Response("Kein Plan vorhanden", { status: 404 });
  }

  const body = new Uint8Array(plan.imageData);
  return new Response(body, {
    headers: {
      "Content-Type": plan.imageMime ?? "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
