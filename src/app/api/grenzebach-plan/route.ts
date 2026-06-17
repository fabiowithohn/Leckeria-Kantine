import { prisma } from "@/lib/db";
import { GRENZEBACH_PLAN_ID } from "@/lib/weekly-plan";

export const dynamic = "force-dynamic";

// Liefert den aktuellen Grenzebach-Wochenplan als PDF-Download.
export async function GET() {
  const plan = await prisma.weeklyPlan.findUnique({
    where: { id: GRENZEBACH_PLAN_ID },
    select: { imageData: true, imageMime: true },
  });

  if (!plan?.imageData) {
    return new Response("Kein Plan vorhanden", { status: 404 });
  }

  const body = new Uint8Array(plan.imageData);
  return new Response(body, {
    headers: {
      "Content-Type": plan.imageMime ?? "application/pdf",
      "Content-Disposition": 'attachment; filename="Wochenplan-Grenzebach.pdf"',
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
