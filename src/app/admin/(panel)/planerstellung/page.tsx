import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { CANTEENS, emptyPlan, normalizePlan, toISODate, isoWeekMonday, weekTitle } from "@/lib/meal-plan";
import { PlanEditor, type DishSuggestion, type PlanMeta, type PlanOption } from "@/components/admin/plan-editor";
import { PlanList } from "@/components/admin/plan-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "Planerstellung – Verwaltung" };

export default async function AdminPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  // Nur die Rolle „planner“ (bekki). Für alle anderen existiert die Seite nicht.
  const session = await getAdminSession();
  if (session?.role !== "planner") notFound();

  const { id } = await searchParams;

  const plans = await prisma.mealPlan.findMany({
    orderBy: [{ year: "desc" }, { week: "desc" }, { canteen: "asc" }],
    select: { id: true, canteen: true, year: true, week: true, updatedAt: true, exportCount: true },
  });
  const canteens = Array.from(new Set([...CANTEENS, ...plans.map((p) => p.canteen)]));

  if (id) {
    const row = await prisma.mealPlan.findUnique({ where: { id } });
    if (!row) notFound();
    const data = normalizePlan(row.data, emptyPlan(row.canteen, row.year, row.week));
    const meta: PlanMeta = {
      id: row.id,
      canteen: row.canteen,
      year: row.year,
      week: row.week,
      mondayISO: toISODate(isoWeekMonday(row.year, row.week)),
      exportCount: row.exportCount,
    };
    const suggestions: DishSuggestion[] = (
      await prisma.planDish.findMany({
        orderBy: [{ uses: "desc" }, { updatedAt: "desc" }],
        take: 600,
        select: { title: true, codes: true, category: true, description: true },
      })
    ).map((d) => ({
      title: d.title,
      codes: d.codes,
      category: d.category as DishSuggestion["category"],
      description: d.description,
    }));

    const otherPlans: PlanOption[] = plans
      .filter((p) => p.id !== row.id)
      .map((p) => ({ id: p.id, label: `${p.canteen} · ${weekTitle(p.year, p.week)}` }));

    return <PlanEditor meta={meta} initial={data} suggestions={suggestions} canteens={canteens} otherPlans={otherPlans} />;
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Planerstellung</h1>
        <p className="mt-1 text-ink-soft">
          Speisepläne für Asteel Flash, Grenzebach und LIBRI direkt hier schreiben,
          als Bild herunterladen oder sofort auf der Website veröffentlichen.
        </p>
      </header>
      <PlanList
        plans={plans.map((p) => ({ ...p, updatedAt: p.updatedAt.toISOString() }))}
        canteens={canteens}
      />
    </div>
  );
}
