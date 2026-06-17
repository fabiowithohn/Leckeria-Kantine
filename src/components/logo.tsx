import Link from "next/link";
import Image from "next/image";

/**
 * Offizielle Leckeria-Wortmarke (Kochmütze + „leckeria").
 * variant: "color" für helle Hintergründe, "white" für dunkle/orangefarbene.
 */
export function Logo({
  variant = "color",
  className = "",
  priority = false,
}: {
  variant?: "color" | "white";
  className?: string;
  priority?: boolean;
}) {
  const src =
    variant === "white"
      ? "/brand/wordmark-white-trim.png"
      : "/brand/navbar-trim.png";
  return (
    <Link href="/" className={`inline-flex items-center ${className}`} aria-label="Leckeria – Startseite">
      <Image
        src={src}
        alt="Leckeria – Kantinen- & Partyservice"
        width={2430}
        height={618}
        priority={priority}
        className="h-11 w-auto sm:h-12"
      />
    </Link>
  );
}

/** Quadratisches Icon-Logo (Food-Illustration) für dekorative Akzente. */
export function LogoIcon({
  variant = "color",
  className = "",
}: {
  variant?: "color" | "white" | "black";
  className?: string;
}) {
  const src = `/brand/icon-${variant}-trim.png`;
  return (
    <Image src={src} alt="Leckeria" width={1660} height={2207} className={className} />
  );
}
