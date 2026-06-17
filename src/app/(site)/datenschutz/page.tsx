import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Datenschutz" };

export default function DatenschutzPage() {
  return (
    <LegalShell
      title="Datenschutzerklärung"
      intro="Der Schutz deiner persönlichen Daten ist uns bei Leckeria ein echtes Anliegen. Nachfolgend erfährst du, welche Daten wir sammeln, wie wir sie nutzen und welche Rechte du hast."
    >
      <h2>1. Verantwortlicher für die Datenverarbeitung</h2>
      <p>
        Verantwortlich für die Verarbeitung deiner personenbezogenen Daten im Sinne
        der Datenschutz-Grundverordnung (DSGVO) ist:
      </p>
      <p>
        <strong>Leckeria</strong>
        <br />
        Inhaber: Antje Schuch
        <br />
        Konrad-Zuse-Straße 19
        <br />
        36251 Bad Hersfeld
        <br />
        Telefon: +49 1515 4722186
        <br />
        E-Mail: leckeria@web.de
      </p>

      <h2>2. Erhebung und Speicherung personenbezogener Daten</h2>
      <p>
        Wir erheben und verarbeiten personenbezogene Daten nur, soweit dies
        erforderlich ist, um dir unsere Leistungen anzubieten und unsere Website zu
        betreiben.
      </p>
      <h3>a) Besuch unserer Website</h3>
      <p>
        Beim Besuch unserer Website werden automatisch bestimmte technische
        Informationen erfasst. Diese Daten sind erforderlich, um die Seite fehlerfrei
        darzustellen und sie sicher betreiben zu können:
      </p>
      <ul>
        <li>IP-Adresse des anfragenden Geräts</li>
        <li>Datum und Uhrzeit der Anfrage</li>
        <li>Name und URL der abgerufenen Datei</li>
        <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
        <li>Browsertyp, -sprache und -version</li>
      </ul>
      <p>
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
        Interesse). Unser berechtigtes Interesse besteht darin, den Betrieb unserer
        Website zu gewährleisten und zu verbessern.
      </p>
      <h3>b) Kontaktaufnahme</h3>
      <p>
        Wenn du uns über ein Kontaktformular, per E-Mail oder telefonisch
        kontaktierst, speichern und verarbeiten wir deine Angaben, um deine Anfrage zu
        beantworten:
      </p>
      <ul>
        <li>Name und Vorname</li>
        <li>E-Mail-Adresse</li>
        <li>Telefonnummer (falls angegeben)</li>
        <li>Deine Nachricht</li>
      </ul>
      <p>
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
        (Vertragserfüllung oder vorvertragliche Maßnahmen).
      </p>
      <h3>c) Cookies und Tracking</h3>
      <p>
        Wir verwenden Cookies, um den Betrieb unserer Website zu verbessern, Inhalte
        zu personalisieren und dir eine optimale Nutzererfahrung zu bieten. Weitere
        Informationen findest du in unserem{" "}
        <Link href="/cookies">Cookie-Hinweis</Link>.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie-Typ</th>
            <th>Zweck</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Essenzielle Cookies</td><td>Notwendig für den Betrieb der Website</td></tr>
          <tr><td>Funktionale Cookies</td><td>Speichern deiner bevorzugten Einstellungen</td></tr>
          <tr><td>Analyse-Cookies</td><td>Anonyme Daten für Website-Statistiken</td></tr>
          <tr><td>Marketing-Cookies</td><td>Anzeige personalisierter Werbung</td></tr>
        </tbody>
      </table>
      <p>
        <strong>Rechtsgrundlage:</strong> Bei Cookies, die nicht essenziell sind,
        holen wir vorab deine Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO ein.
      </p>

      <h2>3. Weitergabe von Daten an Dritte</h2>
      <p>
        Wir geben deine persönlichen Daten grundsätzlich nicht an Dritte weiter, es sei
        denn, dies ist gesetzlich erlaubt oder du hast ausdrücklich eingewilligt.
        Mögliche Empfänger sind:
      </p>
      <ul>
        <li>Dienstleister für den technischen Betrieb der Website (z. B. Hosting-Anbieter)</li>
        <li>Zahlungsdienstleister bei Bestellungen</li>
        <li>Versanddienstleister bei Lieferung von Waren</li>
      </ul>
      <p>
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Erfüllung des
        Vertrags) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem
        wirtschaftlichen Betrieb).
      </p>

      <h2>4. Dauer der Datenspeicherung</h2>
      <p>
        Wir speichern deine personenbezogenen Daten nur so lange, wie es zur
        Erreichung der jeweiligen Verarbeitungszwecke erforderlich ist oder wie es
        gesetzlich vorgeschrieben ist.
      </p>
      <table>
        <thead>
          <tr>
            <th>Datenkategorie</th>
            <th>Speicherdauer</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Technische Daten</td><td>Bis zu 7 Tage</td></tr>
          <tr>
            <td>Kontaktdaten bei Anfragen</td>
            <td>Bis zur vollständigen Bearbeitung deiner Anfrage oder gemäß gesetzlicher Aufbewahrungsfristen</td>
          </tr>
        </tbody>
      </table>

      <h2>5. Deine Rechte</h2>
      <p>
        Du hast das Recht, jederzeit Auskunft über die von uns gespeicherten Daten zu
        erhalten. Darüber hinaus hast du das Recht auf Berichtigung, Löschung oder
        Einschränkung der Verarbeitung deiner Daten. Falls du Fragen zu deinen Rechten
        hast, kannst du dich jederzeit an uns wenden.
      </p>
      <table>
        <thead>
          <tr>
            <th>Recht</th>
            <th>Rechtsgrundlage</th>
            <th>Beschreibung</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Auskunftsrecht</td><td>Art. 15 DSGVO</td><td>Erfahre, welche Daten wir über dich speichern.</td></tr>
          <tr><td>Recht auf Berichtigung</td><td>Art. 16 DSGVO</td><td>Falls deine Daten fehlerhaft sind.</td></tr>
          <tr><td>Recht auf Löschung</td><td>Art. 17 DSGVO</td><td>Unter bestimmten Voraussetzungen können deine Daten gelöscht werden.</td></tr>
          <tr><td>Recht auf Einschränkung</td><td>Art. 18 DSGVO</td><td>Falls die Datenverarbeitung nur eingeschränkt stattfinden soll.</td></tr>
          <tr><td>Recht auf Datenübertragbarkeit</td><td>Art. 20 DSGVO</td><td>Erhalte deine Daten in einem strukturierten Format.</td></tr>
          <tr><td>Widerspruchsrecht</td><td>Art. 21 DSGVO</td><td>Wenn du der Verarbeitung widersprechen möchtest.</td></tr>
          <tr><td>Widerrufsrecht bei Einwilligungen</td><td>Art. 7 Abs. 3 DSGVO</td><td>Du kannst deine Einwilligung jederzeit zurückziehen.</td></tr>
        </tbody>
      </table>
      <p>
        Du hast außerdem das Recht, dich bei einer zuständigen Aufsichtsbehörde für
        den Datenschutz zu beschweren.
      </p>

      <h2>6. Datensicherheit</h2>
      <p>
        Deine Daten werden durch technische und organisatorische Maßnahmen geschützt,
        um sie vor unberechtigtem Zugriff, Verlust oder Missbrauch zu bewahren. Unsere
        Sicherheitsmaßnahmen werden regelmäßig überprüft und angepasst.
      </p>

      <h2>7. Änderungen der Datenschutzerklärung</h2>
      <p>
        Wir behalten uns vor, diese Datenschutzerklärung gelegentlich zu
        aktualisieren, damit sie stets den aktuellen rechtlichen Anforderungen
        entspricht oder um Änderungen unserer Leistungen umzusetzen. Die jeweils
        aktuelle Datenschutzerklärung kannst du jederzeit auf unserer Website
        einsehen.
      </p>

      <hr />
      <p className="text-sm">
        © {new Date().getFullYear()} Leckeria · <Link href="/agb">AGB</Link> ·{" "}
        <Link href="/impressum">Impressum</Link> · <Link href="/cookies">Cookies</Link>
      </p>
    </LegalShell>
  );
}
