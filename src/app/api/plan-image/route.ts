import sharp from "sharp";
import { prisma } from "@/lib/db";
import { isPlanner } from "@/lib/admin-auth";
import { emptyPlan, normalizePlan, planFileName } from "@/lib/meal-plan";
import { renderPlanPng } from "@/lib/plan-render";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST: Live-Vorschau. Body = PlanData (JSON), Antwort = JPEG in Basisgröße
 * (ca. 250 KB statt 1,7 MB als PNG – die Vorschau lädt dadurch deutlich schneller).
 * Nur für die Rolle „planner“.
 */
export async function POST(req: Request) {
  if (!(await isPlanner())) return new Response("Nicht erlaubt", { status: 403 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Ungültige Daten", { status: 400 });
  }
  const plan = normalizePlan(body, emptyPlan("", 2000, 1));
  const kwRaw = (body as { kw?: unknown })?.kw;
  const kw = typeof kwRaw === "number" && kwRaw >= 1 && kwRaw <= 53 ? kwRaw : undefined;
  const png = await renderPlanPng(plan, 1, kw);
  const jpeg = await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store" },
  });
}

/**
 * GET ?id=<planId>&format=png|jpg: Download in doppelter Auflösung (3200 × 2262).
 * Der Dateiname enthält Kalenderwoche, Jahr, Kantine und eine fortlaufende
 * Nummer, die pro Plan mit jedem Download hochzählt.
 */
export async function GET(req: Request) {
  if (!(await isPlanner())) return new Response("Nicht erlaubt", { status: 403 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const format = url.searchParams.get("format") === "jpg" ? "jpg" : "png";

  const row = await prisma.mealPlan.findUnique({ where: { id } });
  if (!row) return new Response("Plan nicht gefunden", { status: 404 });

  const updated = await prisma.mealPlan.update({
    where: { id },
    data: { exportCount: { increment: 1 } },
    select: { exportCount: true },
  });

  const plan = normalizePlan(row.data, emptyPlan(row.canteen, row.year, row.week));
  const png = await renderPlanPng(plan, 2, row.week);
  // Vercel erlaubt max. 4,5 MB pro Antwort. Das rohe PNG hat ~6 MB, nachkomprimiert ~1,2 MB.
  const file =
    format === "jpg"
      ? await sharp(png).jpeg({ quality: 92, mozjpeg: true }).toBuffer()
      : await sharp(png).png({ compressionLevel: 9, effort: 7 }).toBuffer();
  const name = planFileName(row, updated.exportCount, format);

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": format === "jpg" ? "image/jpeg" : "image/png",
      "Content-Disposition": `attachment; filename="${name}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "no-store",
    },
  });
}
