"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import sharp from "sharp";
import { prisma } from "@/lib/db";
import { requirePlanner } from "@/lib/admin-auth";
import {
  CANTEENS,
  dishKey,
  emptyPlan,
  isoWeekOf,
  normalizePlan,
  sortCodes,
  type PlanData,
} from "@/lib/meal-plan";
import { renderPlanPng } from "@/lib/plan-render";
import { ASTEEL_FLASH_PLAN_ID, GRENZEBACH_PLAN_ID } from "@/lib/weekly-plan";

export type PlanActionResult = {
  ok?: boolean;
  error?: string;
  /** ID des (neu angelegten oder bereits vorhandenen) Plans */
  id?: string;
};

function cleanCanteen(raw: unknown): string {
  return String(raw ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
}

function isUniqueError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

/** Neuen Plan für Kantine + Woche (Montag als ISO-Datum) anlegen. */
export async function createPlan(input: { canteen: string; mondayISO: string }): Promise<PlanActionResult> {
  await requirePlanner();
  const canteen = cleanCanteen(input.canteen);
  if (!canteen) return { error: "Bitte eine Kantine angeben." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.mondayISO)) return { error: "Bitte ein Datum wählen." };
  const { year, week } = isoWeekOf(input.mondayISO);

  const existing = await prisma.mealPlan.findUnique({
    where: { canteen_year_week: { canteen, year, week } },
    select: { id: true },
  });
  if (existing) {
    return { error: `Für ${canteen} gibt es in KW ${week}/${year} schon einen Plan.`, id: existing.id };
  }

  const data = emptyPlan(canteen, year, week);
  const created = await prisma.mealPlan.create({
    data: { canteen, year, week, data: data as unknown as Prisma.InputJsonValue },
    select: { id: true },
  });
  revalidatePath("/admin/planerstellung");
  return { ok: true, id: created.id };
}

/**
 * Plan speichern (Autosave aus dem Editor). Kantine und Woche können dabei
 * geändert werden; Gerichte mit Titel wandern in den Gerichte-Merker.
 */
export async function savePlan(input: {
  id: string;
  canteen: string;
  mondayISO: string;
  data: unknown;
}): Promise<PlanActionResult> {
  await requirePlanner();
  const row = await prisma.mealPlan.findUnique({ where: { id: input.id } });
  if (!row) return { error: "Plan nicht gefunden (wurde er gelöscht?)." };

  const canteen = cleanCanteen(input.canteen) || row.canteen;
  const { year, week } = /^\d{4}-\d{2}-\d{2}$/.test(input.mondayISO)
    ? isoWeekOf(input.mondayISO)
    : { year: row.year, week: row.week };
  const data = normalizePlan(input.data, emptyPlan(canteen, year, week));
  data.canteen = canteen;

  try {
    await prisma.mealPlan.update({
      where: { id: input.id },
      data: { canteen, year, week, data: data as unknown as Prisma.InputJsonValue },
    });
  } catch (err) {
    if (isUniqueError(err)) {
      return { error: `Für ${canteen} gibt es in KW ${week}/${year} schon einen anderen Plan.` };
    }
    throw err;
  }

  await rememberDishes(data);
  revalidatePath("/admin/planerstellung");
  return { ok: true };
}

/** Gerichte-Merker aktualisieren: pro Titel die zuletzt benutzten Angaben. */
async function rememberDishes(data: PlanData): Promise<void> {
  const seen = new Set<string>();
  for (const day of data.days) {
    if (day.closed) continue;
    for (const m of day.menus) {
      const title = m.title.trim();
      const key = dishKey(title);
      if (!title || seen.has(key)) continue;
      seen.add(key);
      await prisma.planDish.upsert({
        where: { key },
        update: {
          title,
          codes: sortCodes(m.codes),
          category: m.category,
          description: m.description.trim(),
          uses: { increment: 1 },
        },
        create: {
          key,
          title,
          codes: sortCodes(m.codes),
          category: m.category,
          description: m.description.trim(),
        },
      });
    }
  }
}

/** Plan als Kopie für eine andere Kantine (gleiche Woche) oder Woche anlegen. */
export async function duplicatePlan(input: {
  id: string;
  canteen: string;
  mondayISO?: string;
}): Promise<PlanActionResult> {
  await requirePlanner();
  const row = await prisma.mealPlan.findUnique({ where: { id: input.id } });
  if (!row) return { error: "Plan nicht gefunden." };
  const canteen = cleanCanteen(input.canteen) || row.canteen;
  const { year, week } =
    input.mondayISO && /^\d{4}-\d{2}-\d{2}$/.test(input.mondayISO)
      ? isoWeekOf(input.mondayISO)
      : { year: row.year, week: row.week };

  const data = normalizePlan(row.data, emptyPlan(canteen, year, week));
  data.canteen = canteen;
  if (year !== row.year || week !== row.week) {
    data.dateLabel = emptyPlan(canteen, year, week).dateLabel;
  }

  try {
    const created = await prisma.mealPlan.create({
      data: { canteen, year, week, data: data as unknown as Prisma.InputJsonValue },
      select: { id: true },
    });
    revalidatePath("/admin/planerstellung");
    return { ok: true, id: created.id };
  } catch (err) {
    if (isUniqueError(err)) return { error: `Für ${canteen} gibt es in KW ${week}/${year} schon einen Plan.` };
    throw err;
  }
}

export async function deletePlan(id: string): Promise<PlanActionResult> {
  await requirePlanner();
  await prisma.mealPlan.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/planerstellung");
  return { ok: true };
}

/**
 * Fertigen Plan direkt als aktuellen Wochenplan auf der Website veröffentlichen
 * (ersetzt das bisher hochgeladene Bild bei Asteel Flash bzw. Grenzebach).
 */
export async function publishPlan(input: {
  id: string;
  target: "asteel-flash" | "grenzebach";
}): Promise<PlanActionResult> {
  await requirePlanner();
  const row = await prisma.mealPlan.findUnique({ where: { id: input.id } });
  if (!row) return { error: "Plan nicht gefunden." };

  const plan = normalizePlan(row.data, emptyPlan(row.canteen, row.year, row.week));
  const png = await renderPlanPng(plan, 1, row.week);
  const jpeg = await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  const imageData = new Uint8Array(jpeg.length);
  imageData.set(jpeg);

  const planId = input.target === "asteel-flash" ? ASTEEL_FLASH_PLAN_ID : GRENZEBACH_PLAN_ID;
  const title = plan.dateLabel;
  await prisma.weeklyPlan.upsert({
    where: { id: planId },
    update: { title, imageData, imageMime: "image/jpeg" },
    create: { id: planId, title, imageData, imageMime: "image/jpeg" },
  });

  if (input.target === "asteel-flash") {
    revalidatePath("/speisekarte");
    revalidatePath("/admin/speisekarte");
    revalidatePath("/");
  } else {
    revalidatePath("/grenzebach");
    revalidatePath("/admin/grenzebach");
  }
  return { ok: true };
}

/** Feste Kantinen-Auswahl für den Editor (plus Freitext). */
export async function canteenOptions(): Promise<string[]> {
  await requirePlanner();
  const used = await prisma.mealPlan.findMany({ distinct: ["canteen"], select: { canteen: true } });
  return Array.from(new Set([...CANTEENS, ...used.map((u) => u.canteen)]));
}
