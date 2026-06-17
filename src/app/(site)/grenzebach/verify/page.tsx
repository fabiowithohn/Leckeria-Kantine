import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { verifyEmailToken } from "@/app/(site)/grenzebach/actions";

export const metadata = { title: "E-Mail bestätigen – Grenzebach" };
export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await verifyEmailToken(token ?? "");

  return (
    <AuthShell title={result.ok ? "E-Mail bestätigt" : "Bestätigung fehlgeschlagen"}>
      <div className="text-center">
        <p className="text-4xl">{result.ok ? "✅" : "⚠️"}</p>
        <p className="mt-4 text-ink-soft">{result.message}</p>
        <Link
          href={result.ok ? "/grenzebach/login" : "/grenzebach/register"}
          className="mt-6 inline-block rounded-full bg-brand-500 shadow-warm px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          {result.ok ? "Zum Login" : "Zur Registrierung"}
        </Link>
      </div>
    </AuthShell>
  );
}
