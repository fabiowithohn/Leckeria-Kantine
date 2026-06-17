"use server";

import { z } from "zod";
import { sendMail, contactConfirmationEmailHtml } from "@/lib/mail";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

/**
 * Sendet eine automatische Eingangsbestätigung an die im Kontaktformular
 * angegebene Adresse (Absender: no-reply@leckeria-kantine.de via SMTP).
 * Best effort – Fehler werden geschluckt, da die eigentliche Anfrage bereits
 * über Web3Forms zugestellt wurde.
 */
export async function sendContactConfirmation(args: {
  name: string;
  email: string;
}): Promise<{ ok: boolean }> {
  const parsed = schema.safeParse(args);
  if (!parsed.success) return { ok: false };

  try {
    await sendMail({
      to: parsed.data.email,
      subject: "Wir haben deine Anfrage erhalten – Leckeria",
      html: contactConfirmationEmailHtml(parsed.data.name),
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
