import type { Category } from "@/lib/meal-plan";
import { CATEGORY_ICON_PATHS } from "@/lib/plan-icons";

/** Kategorie-Symbol (Rind, Huhn, Schwein, Fisch, Vegetarisch) als Linien-Icon. */
export function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={CATEGORY_ICON_PATHS[category]} />
    </svg>
  );
}
