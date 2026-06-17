import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/auth-forms";

export const metadata = { title: "Registrieren – Grenzebach" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/grenzebach");

  return (
    <AuthShell
      title="Konto erstellen"
      subtitle="Lege ein Profil an, um Essen in der Kantine Grenzebach zu bestellen."
    >
      <RegisterForm />
    </AuthShell>
  );
}
