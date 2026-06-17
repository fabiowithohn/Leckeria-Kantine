import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";

export const metadata = { title: "Login – Grenzebach" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/grenzebach");

  return (
    <AuthShell
      title="Willkommen zurück"
      subtitle="Melde dich an, um dein Mittagessen zu bestellen."
    >
      <LoginForm />
    </AuthShell>
  );
}
