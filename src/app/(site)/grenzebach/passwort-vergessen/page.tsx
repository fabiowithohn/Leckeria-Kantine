import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/auth-forms";

export const metadata = { title: "Passwort vergessen – Grenzebach" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Passwort vergessen"
      subtitle="Gib deine E-Mail-Adresse ein – wir senden dir einen Link zum Zurücksetzen."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
