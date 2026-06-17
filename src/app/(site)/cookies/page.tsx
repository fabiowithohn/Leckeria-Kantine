import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Cookies" };

export default function CookiesPage() {
  return (
    <LegalShell
      title="Cookie-Hinweis"
      intro="Wir verwenden Cookies, aber nur die guten! 🍪 Damit alles reibungslos läuft und du eine tolle Nutzererfahrung hast, setzen wir verschiedene Arten von Cookies ein – immer mit Respekt für deine Privatsphäre."
    >
      <h2>1. Was sind Cookies?</h2>
      <p>
        Ein Cookie ist eine kleine Datei aus Buchstaben und Zahlen, die auf den
        Computer heruntergeladen wird, wenn Nutzer auf bestimmte Websites zugreifen.
        In der Regel ermöglichen es Cookies einer Website, den Computer eines Nutzers
        zu erkennen.
      </p>

      <h2>2. Welche Cookies verwenden wir?</h2>
      <table>
        <thead>
          <tr>
            <th>Cookie-Typ</th>
            <th>Was passiert</th>
            <th>Speicherdauer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Essenzielle Cookies</strong></td>
            <td>Speichern von Sitzung und Sicherheit – ohne sie kann die Website nicht betrieben werden</td>
            <td>Nur während deiner Sitzung</td>
          </tr>
          <tr>
            <td><strong>Funktionale Cookies</strong></td>
            <td>Deine Einstellungen und Vorlieben speichern (z. B. Sprache, Layout)</td>
            <td>Bis zu 1 Jahr</td>
          </tr>
          <tr>
            <td><strong>Analyse- &amp; Statistik-Cookies</strong></td>
            <td>Anonyme Statistik-Daten sammeln (z. B. durch Google Analytics) zur Verbesserung der Website</td>
            <td>Bis zu 2 Jahre</td>
          </tr>
          <tr>
            <td><strong>Marketing- &amp; Tracking-Cookies</strong></td>
            <td>Anzeigen anpassen und deren Erfolg messen – damit du nur relevante Werbung siehst</td>
            <td>Bis zu 2 Jahre</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Essenzielle Cookies</h2>
      <p>
        Diese Cookies brauchen wir, damit die Website überhaupt funktioniert – quasi
        das Grundgerüst. Ohne sie könnten wir keine Seiten bereitstellen, die sich
        sicher aufrufen lassen oder einfach zu navigieren sind.
      </p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</p>

      <h2>4. Funktionale Cookies</h2>
      <p>
        Damit du nicht jedes Mal dieselben Einstellungen vornehmen musst, speichern
        diese Cookies, was dir wichtig ist – z. B. deine bevorzugte Sprache oder
        Layout-Einstellungen.
      </p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</p>

      <h2>5. Analyse- und Statistik-Cookies</h2>
      <p>
        Diese Cookies helfen uns zu verstehen, wie die Seite genutzt wird und was wir
        besser machen können. Die Informationen werden anonym gesammelt – wir wollen
        nur wissen, welche Seiten du spannend findest, um die Website für alle
        Besucher zu verbessern.
      </p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</p>

      <h2>6. Marketing- und Tracking-Cookies</h2>
      <p>
        Wir nutzen diese Cookies, um dir nur das zu zeigen, was dich wirklich
        interessiert, und um unsere Kampagnen zu verbessern.
      </p>
      <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</p>

      <h2>7. Deine Wahl, deine Cookies!</h2>
      <p>
        Du hast die Kontrolle: Beim ersten Besuch und bei Änderungen an unserer
        Cookie-Richtlinie fragen wir dich um deine Erlaubnis. Möchtest du lieber nur
        die essenziellen Cookies nutzen? Kein Problem – du kannst das ganz einfach
        einstellen und jederzeit ändern.
      </p>
      <p>
        Falls du später deine Meinung änderst: Einfach wieder in die Einstellungen
        schauen und anpassen. So hast du jederzeit die Freiheit zu entscheiden!
      </p>

      <p>
        Hast du Fragen? Mehr Infos zu deiner Privatsphäre findest du in unserer{" "}
        <Link href="/datenschutz">Datenschutzerklärung</Link>.
      </p>

      <hr />
      <p className="text-sm">
        © {new Date().getFullYear()} Leckeria · <Link href="/agb">AGB</Link> ·{" "}
        <Link href="/datenschutz">Datenschutz</Link> · <Link href="/impressum">Impressum</Link>
      </p>
    </LegalShell>
  );
}
