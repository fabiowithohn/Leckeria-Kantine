import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin-nav";
import { adminLogout } from "@/app/admin/actions";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col bg-sand-100 lg:flex-row">
      <aside className="flex flex-col gap-6 bg-brand-800 p-5 text-sand-50 lg:w-64">
        <div>
          <p className="font-display text-xl font-semibold">Leckeria</p>
          <p className="text-xs text-sand-200">Verwaltung</p>
        </div>
        <AdminNav />
        <div className="mt-auto space-y-2 border-t border-brand-700/60 pt-4 text-sm">
          <Link href="/" className="block text-sand-200 hover:text-white">
            ↗ Zur Website
          </Link>
          <form action={adminLogout}>
            <button type="submit" className="text-sand-200 hover:text-white">
              Abmelden
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
    </div>
  );
}
