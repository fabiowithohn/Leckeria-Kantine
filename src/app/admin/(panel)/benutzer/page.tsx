import { prisma } from "@/lib/db";
import { UsersManager, type UserRow } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mitarbeitende – Verwaltung" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      emailVerified: true,
      approved: true,
      createdAt: true,
    },
  });

  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    name: u.name,
    email: u.email,
    verified: u.emailVerified != null,
    approved: u.approved,
    createdAt: u.createdAt.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    createdAtTs: u.createdAt.getTime(),
  }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Grenzebach-Mitarbeitende</h1>
        <p className="mt-1 text-ink-soft">
          Registrierte Konten verwalten: Vor- und Nachnamen anpassen sowie
          Passwörter zurücksetzen. Insgesamt {rows.length} Konto(en).
        </p>
      </header>
      <UsersManager users={rows} />
    </div>
  );
}
