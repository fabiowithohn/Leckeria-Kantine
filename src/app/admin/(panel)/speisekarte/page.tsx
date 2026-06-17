import { getPlanMeta } from "@/lib/weekly-plan";
import { WeeklyPlanManager } from "@/components/admin/weekly-plan-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Asteel Flash Wochenplan – Verwaltung" };

export default async function AdminAsteelFlashPage() {
  const plan = await getPlanMeta();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Asteel Flash – Wochenplan</h1>
        <p className="mt-1 text-ink-soft">
          Lade hier den wöchentlichen Speiseplan der öffentlichen Kantine Asteel
          Flash als Bild hoch. Er erscheint sofort auf der Seite „Asteel Flash“.
        </p>
      </header>
      <WeeklyPlanManager
        hasImage={plan?.hasImage ?? false}
        title={plan?.title ?? null}
        version={plan?.version ?? "0"}
      />
    </div>
  );
}
