import { prisma } from "@/lib/db";
import {
  GrenzebachManager,
  type LibDish,
  type SlotItem,
} from "@/components/admin/grenzebach-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Grenzebach-Gerichte – Verwaltung" };

const SLOTS: { key: string; label: string }[] = [
  { key: "DAILY_FIXED", label: "Tägliche Speisen" },
  { key: "MON", label: "Montag" },
  { key: "TUE", label: "Dienstag" },
  { key: "WED", label: "Mittwoch" },
  { key: "THU", label: "Donnerstag" },
  { key: "FRI", label: "Freitag" },
];

export default async function AdminGrenzebachPage() {
  const [dishes, imaged, assignments] = await Promise.all([
    prisma.dish.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, description: true, allergens: true, additives: true, updatedAt: true },
    }),
    prisma.dish.findMany({ where: { NOT: { imageData: null } }, select: { id: true } }),
    prisma.menuAssignment.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, slot: true, active: true, dishId: true },
    }),
  ]);

  const withImage = new Set(imaged.map((d) => d.id));
  const version = (d: { updatedAt: Date }) => d.updatedAt.getTime().toString();
  const dishById = new Map(dishes.map((d) => [d.id, d]));

  const slotItems: Record<string, SlotItem[]> = {};
  for (const s of SLOTS) slotItems[s.key] = [];
  const dishSlots: Record<string, string[]> = {};

  for (const a of assignments) {
    const d = dishById.get(a.dishId);
    if (!d) continue;
    slotItems[a.slot].push({
      assignmentId: a.id,
      dishId: d.id,
      title: d.title,
      hasImage: withImage.has(d.id),
      imageVersion: version(d),
      active: a.active,
    });
    (dishSlots[d.id] ??= []).push(a.slot);
  }

  const library: LibDish[] = dishes.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    allergens: d.allergens,
    additives: d.additives,
    hasImage: withImage.has(d.id),
    imageVersion: version(d),
    slots: dishSlots[d.id] ?? [],
  }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Gerichte Kantine Grenzebach</h1>
        <p className="mt-1 text-ink-soft">
          Lege Gerichte in der <strong>Bibliothek</strong> einmal an und ordne sie
          dann den Wochentagen zu. Ein Gericht kann an mehreren Tagen erscheinen,
          ohne es mehrfach anzulegen.
        </p>
      </header>
      <GrenzebachManager library={library} slots={SLOTS} slotItems={slotItems} />
    </div>
  );
}
