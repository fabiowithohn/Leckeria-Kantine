import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata = { title: "Verwaltung – Login" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { expired } = await searchParams;

  return (
    <div className="grain flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-500 via-brand-500 to-brand-600 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-2xl font-semibold text-ink">
          Leckeria Verwaltung
        </h1>
        {expired ? (
          <p className="mt-4 rounded-xl bg-gold-400/20 px-4 py-3 text-center text-sm font-medium text-ink">
            Deine Sitzung ist abgelaufen. Bitte melde dich erneut an – deine
            letzte Änderung wurde dabei nicht gespeichert.
          </p>
        ) : (
          <p className="mt-1 text-center text-sm text-ink-soft">
            Bitte mit den Zugangsdaten anmelden.
          </p>
        )}
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
