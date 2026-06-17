"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin, setAdminSession } from "@/lib/admin-auth";
import { parsePriceToCents } from "@/lib/format";
import { processDishImage } from "@/lib/image";
import { ASTEEL_FLASH_PLAN_ID, GRENZEBACH_PLAN_ID } from "@/lib/weekly-plan";
import { ALLERGEN_BY_NR, ADDITIVE_BY_CODE } from "@/lib/allergens";

/** Liest die ausgewählten Allergen-Nummern aus dem Formular und filtert auf gültige Werte (1–14). */
function parseAllergens(formData: FormData): string[] {
  const valid = formData
    .getAll("allergens")
    .map((v) => String(v))
    .filter((v) => v in ALLERGEN_BY_NR);
  // Duplikate entfernen, Reihenfolge 1–14 beibehalten
  return Object.keys(ALLERGEN_BY_NR).filter((nr) => valid.includes(nr));
}

/** Liest die ausgewählten Zusatzstoff-Kürzel aus dem Formular und filtert auf gültige Werte (a–m). */
function parseAdditives(formData: FormData): string[] {
  const valid = formData
    .getAll("additives")
    .map((v) => String(v))
    .filter((v) => v in ADDITIVE_BY_CODE);
  // Duplikate entfernen, Reihenfolge a–m beibehalten
  return Object.keys(ADDITIVE_BY_CODE).filter((code) => valid.includes(code));
}

async function ensureAdmin() {
  // Abgelaufene/fehlende Sitzung → freundliche Weiterleitung zum Login
  // (statt einer rohen Runtime-Error-Box).
  if (!(await isAdmin())) redirect("/admin/login?expired=1");
  // Gleitende Verlängerung: jede Admin-Aktion setzt die 12-Stunden-Frist zurück,
  // sodass man nur nach echter Inaktivität ausgeloggt wird.
  await setAdminSession();
}

function revalidateAll() {
  revalidatePath("/admin/grenzebach");
  revalidatePath("/admin/speisekarte");
  revalidatePath("/admin/aktuelles");
  revalidatePath("/grenzebach");
  revalidatePath("/speisekarte");
  revalidatePath("/aktuelles");
  revalidatePath("/");
}

export type ActionResult = { ok?: boolean; error?: string };

// ============ Grenzebach: Gericht-Bibliothek + Zuordnungen ============
const SLOTS = ["MON", "TUE", "WED", "THU", "FRI", "DAILY_FIXED"] as const;
type Slot = (typeof SLOTS)[number];

function revalidateGrenzebach() {
  revalidatePath("/admin/grenzebach");
  revalidatePath("/grenzebach");
}

// ---- Bibliothek (Dish) ----
export async function createLibraryDish(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Bitte einen Titel angeben." };

  const image = await processDishImage(formData.get("image"));
  const dish = await prisma.dish.create({
    data: {
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      allergens: parseAllergens(formData),
      additives: parseAdditives(formData),
      ...(image ? { imageData: image.data, imageMime: image.mime } : {}),
    },
  });

  // optionale Direktzuordnung zu einem Slot (z.B. direkt beim Anlegen)
  const slot = String(formData.get("slot") ?? "");
  if ((SLOTS as readonly string[]).includes(slot)) {
    await assignInternal(dish.id, slot as Slot);
  }
  revalidateGrenzebach();
  return { ok: true };
}

export async function updateLibraryDish(id: string, formData: FormData): Promise<ActionResult> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Bitte einen Titel angeben." };

  const image = await processDishImage(formData.get("image"));
  await prisma.dish.update({
    where: { id },
    data: {
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      allergens: parseAllergens(formData),
      additives: parseAdditives(formData),
      // Bild nur ersetzen, wenn ein neues hochgeladen wurde
      ...(image ? { imageData: image.data, imageMime: image.mime } : {}),
    },
  });
  revalidateGrenzebach();
  return { ok: true };
}

export async function removeLibraryDishImage(id: string): Promise<ActionResult> {
  await ensureAdmin();
  await prisma.dish.update({ where: { id }, data: { imageData: null, imageMime: null } });
  revalidateGrenzebach();
  return { ok: true };
}

export async function deleteLibraryDish(id: string): Promise<ActionResult> {
  await ensureAdmin();
  const count = await prisma.booking.count({ where: { dishId: id } });
  if (count > 0) {
    // Gericht hat Bestellungen → aus allen Tagen nehmen, in Bibliothek belassen
    await prisma.menuAssignment.deleteMany({ where: { dishId: id } });
    revalidateGrenzebach();
    return {
      ok: true,
      error:
        "Gericht hat Bestellungen – es wurde aus allen Wochentagen entfernt, bleibt aber in der Bibliothek.",
    };
  }
  await prisma.dish.delete({ where: { id } }); // Zuordnungen via Cascade
  revalidateGrenzebach();
  return { ok: true };
}

// ---- Zuordnungen (MenuAssignment) ----
async function assignInternal(dishId: string, slot: Slot) {
  const existing = await prisma.menuAssignment.findUnique({
    where: { dishId_slot: { dishId, slot } },
  });
  if (existing) {
    if (!existing.active) {
      await prisma.menuAssignment.update({ where: { id: existing.id }, data: { active: true } });
    }
    return;
  }
  const max = await prisma.menuAssignment.aggregate({
    where: { slot },
    _max: { sortOrder: true },
  });
  await prisma.menuAssignment.create({
    data: { dishId, slot, sortOrder: (max._max.sortOrder ?? -1) + 1 },
  });
}

export async function assignDishToSlot(dishId: string, slot: string): Promise<ActionResult> {
  await ensureAdmin();
  if (!(SLOTS as readonly string[]).includes(slot)) return { error: "Ungültiger Slot." };
  await assignInternal(dishId, slot as Slot);
  revalidateGrenzebach();
  return { ok: true };
}

export async function unassignDish(assignmentId: string): Promise<ActionResult> {
  await ensureAdmin();
  await prisma.menuAssignment.delete({ where: { id: assignmentId } }).catch(() => {});
  revalidateGrenzebach();
  return { ok: true };
}

export async function toggleAssignmentActive(
  assignmentId: string,
  active: boolean,
): Promise<ActionResult> {
  await ensureAdmin();
  await prisma.menuAssignment.update({ where: { id: assignmentId }, data: { active } });
  revalidateGrenzebach();
  return { ok: true };
}

export async function reorderSlot(assignmentIds: string[]): Promise<ActionResult> {
  await ensureAdmin();
  await prisma.$transaction(
    assignmentIds.map((id, index) =>
      prisma.menuAssignment.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
  revalidateGrenzebach();
  return { ok: true };
}

// ============ Speisekarte (MenuItem) ============
export async function createMenuItem(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const section = String(formData.get("section") ?? "").trim();
  if (!title) return { error: "Bitte einen Titel angeben." };
  if (!section) return { error: "Bitte einen Abschnitt angeben." };

  const max = await prisma.menuItem.aggregate({ _max: { sortOrder: true } });
  await prisma.menuItem.create({
    data: {
      title,
      section,
      description: String(formData.get("description") ?? "").trim() || null,
      priceCents: parsePriceToCents(String(formData.get("price") ?? "")),
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });
  revalidateAll();
  return { ok: true };
}

export async function updateMenuItem(id: string, formData: FormData): Promise<ActionResult> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const section = String(formData.get("section") ?? "").trim();
  if (!title || !section) return { error: "Titel und Abschnitt sind erforderlich." };
  await prisma.menuItem.update({
    where: { id },
    data: {
      title,
      section,
      description: String(formData.get("description") ?? "").trim() || null,
      priceCents: parsePriceToCents(String(formData.get("price") ?? "")),
    },
  });
  revalidateAll();
  return { ok: true };
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  await ensureAdmin();
  await prisma.menuItem.delete({ where: { id } });
  revalidateAll();
  return { ok: true };
}

export async function toggleMenuItemActive(id: string, active: boolean): Promise<ActionResult> {
  await ensureAdmin();
  await prisma.menuItem.update({ where: { id }, data: { active } });
  revalidateAll();
  return { ok: true };
}

export async function reorderMenuItems(ids: string[]): Promise<ActionResult> {
  await ensureAdmin();
  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.menuItem.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );
  revalidateAll();
  return { ok: true };
}

// ============ Aktuelles (News) ============
export async function createNews(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return { error: "Titel und Text sind erforderlich." };
  const image = await processDishImage(formData.get("image"));
  await prisma.newsPost.create({
    data: {
      title,
      body,
      ...(image ? { imageData: image.data, imageMime: image.mime } : {}),
    },
  });
  revalidateAll();
  return { ok: true };
}

/** Titel & Text eines bestehenden Beitrags bearbeiten. */
export async function updateNews(id: string, formData: FormData): Promise<ActionResult> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return { error: "Titel und Text sind erforderlich." };
  await prisma.newsPost.update({ where: { id }, data: { title, body } });
  revalidateAll();
  return { ok: true };
}

/** Bild eines Beitrags setzen/ersetzen (Upload per Drag & Drop im Backend). */
export async function updateNewsImage(id: string, formData: FormData): Promise<ActionResult> {
  await ensureAdmin();
  const image = await processDishImage(formData.get("image"));
  if (!image) return { error: "Bitte eine gültige Bilddatei wählen." };
  await prisma.newsPost.update({
    where: { id },
    data: { imageData: image.data, imageMime: image.mime },
  });
  revalidateAll();
  return { ok: true };
}

export async function removeNewsImage(id: string): Promise<ActionResult> {
  await ensureAdmin();
  await prisma.newsPost.update({ where: { id }, data: { imageData: null, imageMime: null } });
  revalidateAll();
  return { ok: true };
}

export async function deleteNews(id: string): Promise<ActionResult> {
  await ensureAdmin();
  await prisma.newsPost.delete({ where: { id } });
  revalidateAll();
  return { ok: true };
}

export async function toggleNewsPublished(id: string, published: boolean): Promise<ActionResult> {
  await ensureAdmin();
  await prisma.newsPost.update({ where: { id }, data: { published } });
  revalidateAll();
  return { ok: true };
}

// ============ Asteel Flash – Wochenplan (Bild) ============
export async function updateWeeklyPlan(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim() || null;
  const image = await processDishImage(formData.get("image"));

  const existing = await prisma.weeklyPlan.findUnique({
    where: { id: ASTEEL_FLASH_PLAN_ID },
  });
  if (!existing && !image) {
    return { error: "Bitte ein Bild des Wochenplans hochladen." };
  }

  await prisma.weeklyPlan.upsert({
    where: { id: ASTEEL_FLASH_PLAN_ID },
    update: {
      title,
      ...(image ? { imageData: image.data, imageMime: image.mime } : {}),
    },
    create: {
      id: ASTEEL_FLASH_PLAN_ID,
      title,
      ...(image ? { imageData: image.data, imageMime: image.mime } : {}),
    },
  });

  revalidatePath("/speisekarte");
  revalidatePath("/admin/speisekarte");
  revalidatePath("/");
  return { ok: true };
}

// ============ Grenzebach – Wochenplan (PDF) ============
export async function updateGrenzebachPlan(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await ensureAdmin();
  const title = String(formData.get("title") ?? "").trim() || null;

  const entry = formData.get("file");
  let file: { data: Uint8Array<ArrayBuffer>; mime: string } | null = null;
  if (entry && typeof entry !== "string" && typeof entry.arrayBuffer === "function" && entry.size > 0) {
    const isPdf = entry.type === "application/pdf" || /\.pdf$/i.test(entry.name ?? "");
    if (!isPdf) return { error: "Bitte eine PDF-Datei hochladen." };
    const buf = Buffer.from(await entry.arrayBuffer());
    const u8 = new Uint8Array(buf.length);
    u8.set(buf);
    file = { data: u8, mime: "application/pdf" };
  }

  const existing = await prisma.weeklyPlan.findUnique({ where: { id: GRENZEBACH_PLAN_ID } });
  if (!existing && !file) {
    return { error: "Bitte eine PDF-Datei des Wochenplans hochladen." };
  }

  await prisma.weeklyPlan.upsert({
    where: { id: GRENZEBACH_PLAN_ID },
    update: { title, ...(file ? { imageData: file.data, imageMime: file.mime } : {}) },
    create: {
      id: GRENZEBACH_PLAN_ID,
      title,
      ...(file ? { imageData: file.data, imageMime: file.mime } : {}),
    },
  });

  revalidatePath("/grenzebach");
  revalidatePath("/admin/grenzebach");
  return { ok: true };
}

export async function removeGrenzebachPlan(): Promise<ActionResult> {
  await ensureAdmin();
  await prisma.weeklyPlan
    .update({ where: { id: GRENZEBACH_PLAN_ID }, data: { imageData: null, imageMime: null } })
    .catch(() => {});
  revalidatePath("/grenzebach");
  revalidatePath("/admin/grenzebach");
  return { ok: true };
}
