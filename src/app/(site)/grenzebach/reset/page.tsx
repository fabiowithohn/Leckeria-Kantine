import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "@/components/auth-forms";

export const metadata = { title: "Neues Passwort – Grenzebach" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell title="Link ungültig">
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center">
          <p className="text-sm text-ink-soft">
            Dieser Link ist unvollständig oder ungültig. Bitte fordere einen neuen
            Link an.
          </p>
          <Link
            href="/grenzebach/passwort-vergessen"
            className="mt-4 inline-block text-sm font-semibold text-brand-700 underline"
          >
            Neuen Link anfordern
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Neues Passwort"
      subtitle="Wähle ein neues Passwort für dein Konto in der Kantine Grenzebach."
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
