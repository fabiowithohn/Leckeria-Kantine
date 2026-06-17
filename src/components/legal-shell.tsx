import type { ReactNode } from "react";
import { Container } from "@/components/ui";

export function LegalShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="py-16">
      <Container className="max-w-3xl">
        <p className="mb-2 text-sm font-extrabold uppercase tracking-widest text-brand-500">
          Rechtliches
        </p>
        <h1 className="text-4xl font-black text-ink">{title}</h1>
        {intro && <p className="mt-4 text-lg text-ink-soft">{intro}</p>}
        <div className="legal mt-8">{children}</div>
      </Container>
    </div>
  );
}
