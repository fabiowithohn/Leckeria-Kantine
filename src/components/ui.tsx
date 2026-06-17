import Link from "next/link";
import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-6xl px-4 ${className}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center = false,
  tone = "ink",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  center?: boolean;
  tone?: "ink" | "light";
}) {
  const titleColor = tone === "light" ? "text-white" : "text-ink";
  const introColor = tone === "light" ? "text-sand-100/80" : "text-ink-soft";
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-2xl`}>
      {eyebrow && (
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-brand-500">
          <span className="h-1.5 w-1.5 rounded-full bg-herb-500" />
          {eyebrow}
        </p>
      )}
      <h2 className={`text-3xl sm:text-4xl ${titleColor}`}>{title}</h2>
      {intro && <p className={`mt-4 text-lg ${introColor}`}>{intro}</p>}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "light";
  className?: string;
}) {
  const styles = {
    primary: "bg-brand-500 text-white shadow-warm hover:bg-brand-600",
    secondary: "bg-gold-400 text-ink hover:bg-gold-300",
    ghost: "border-2 border-brand-500 text-brand-700 hover:bg-brand-50",
    light: "bg-white text-brand-700 hover:bg-sand-100",
  }[variant];
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-extrabold transition active:scale-[0.98] ${styles} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "open" | "closed";
}) {
  const styles = {
    neutral: "bg-sand-100 text-ink-soft",
    open: "bg-herb-500/15 text-herb-600",
    closed: "bg-brand-100 text-brand-700",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${styles}`}>
      {children}
    </span>
  );
}
