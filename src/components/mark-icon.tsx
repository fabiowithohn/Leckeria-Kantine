/**
 * Rendert ein Linien-SVG-Icon für Allergene & Zusatzstoffe.
 * `path` ist das `d`-Attribut (viewBox 0 0 24 24) aus src/lib/allergens.ts.
 */
export function MarkIcon({
  path,
  className = "h-4 w-4",
}: {
  path: string;
  className?: string;
}) {
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
      <path d={path} />
    </svg>
  );
}
