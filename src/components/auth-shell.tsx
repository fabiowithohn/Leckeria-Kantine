import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            Kantine Grenzebach
          </span>
          <h1 className="mt-3 text-3xl font-black text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
        </div>
        <div className="rounded-3xl border border-sand-200 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
