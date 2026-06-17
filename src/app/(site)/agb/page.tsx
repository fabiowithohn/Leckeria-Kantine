import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "AGB" };

export default function AgbPage() {
  return (
    <LegalShell
      title="Allgemeine Geschäftsbedingungen"
      intro="Hier findest du unsere Allgemeinen Geschäftsbedingungen. Sie erklären, wie wir bei Leckeria mit unseren Dienstleistungen umgehen. Bei Fragen sind wir jederzeit für dich da!"
    >
      <h2>1. Geltungsbereich und Anbieter</h2>
      <p>
        Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der
        Website Leckeria sowie für alle darüber entstehenden Kontaktaufnahmen und
        Anfragen. Die AGB regeln das Verhältnis zwischen dir als Nutzer und uns als
        Anbieter.
      </p>
      <p>
        <strong>Anbieter:</strong>
        <br />
        Leckeria
        <br />
        Inhaber: Antje Schuch
        <br />
        Konrad-Zuse-Straße 19
        <br />
        36251 Bad Hersfeld
        <br />
        Telefon: +49 1515 4722186
        <br />
        E-Mail: info@leckeria-kantine.de
      </p>
      <p>
        Mit dem Zugriff auf unsere Website erklärst du dich mit den folgenden
        Bestimmungen einverstanden. Abweichende Regelungen sind nur wirksam, wenn sie
        von uns schriftlich bestätigt wurden.
      </p>

      <h2>2. Zweck der Website</h2>
      <p>
        Unsere Website dient zur Bereitstellung von Informationen über unsere
        Produkte und Dienstleistungen sowie zur Kontaktaufnahme. Es ist derzeit nicht
        möglich, direkt über die Website Bestellungen aufzugeben oder
        Vertragsabschlüsse vorzunehmen.
      </p>

      <h2>3. Haftungsausschluss für Inhalte</h2>
      <h3>a) Inhalte auf der Website</h3>
      <p>
        Alle Inhalte auf unserer Website wurden mit größter Sorgfalt erstellt und
        dienen der Information über unsere Leistungen und unser Unternehmen. Dennoch
        können wir keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität
        der bereitgestellten Inhalte übernehmen.
      </p>
      <h3>b) Externe Links</h3>
      <p>
        Unsere Website kann Links zu externen Websites Dritter enthalten, auf deren
        Inhalte wir keinen Einfluss haben. Daher übernehmen wir für diese fremden
        Inhalte keine Gewähr. Für die Inhalte der verlinkten Seiten ist stets der
        jeweilige Anbieter oder Betreiber verantwortlich. Zum Zeitpunkt der
        Verlinkung wurden die externen Seiten auf mögliche Rechtsverstöße überprüft
        und waren frei von rechtswidrigen Inhalten. Eine permanente inhaltliche
        Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Hinweise auf eine
        Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen
        werden wir derartige Links umgehend entfernen.
      </p>

      <h2>4. Kontaktaufnahme</h2>
      <p>
        Über die Website hast du die Möglichkeit, mit uns per E-Mail oder Telefon in
        Kontakt zu treten. Für die Bearbeitung von Anfragen speichern und verarbeiten
        wir nur die Daten, die für die Beantwortung deiner Anfrage notwendig sind.
      </p>
      <p>
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche
        Maßnahmen) oder Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) bei
        allgemeinen Anfragen.
      </p>

      <h2>5. Datenschutz</h2>
      <p>
        Der Schutz deiner persönlichen Daten ist uns ein wichtiges Anliegen.
        Informationen zur Verarbeitung personenbezogener Daten findest du in unserer{" "}
        <Link href="/datenschutz">Datenschutzerklärung</Link>. Die Nutzung unserer
        Website ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit
        personenbezogene Daten (z. B. Name, E-Mail-Adresse) erhoben werden, erfolgt
        dies stets auf freiwilliger Basis.
      </p>

      <h2>6. Urheberrecht</h2>
      <p>
        Die auf unserer Website veröffentlichten Inhalte und Werke unterliegen dem
        deutschen Urheberrecht. Jede Art der Vervielfältigung, Bearbeitung,
        Verbreitung und Verwertung außerhalb der Grenzen des Urheberrechts bedarf
        unserer schriftlichen Zustimmung. Downloads und Kopien dieser Seite sind nur
        für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit Inhalte auf
        dieser Website nicht vom Betreiber erstellt wurden, werden die Urheberrechte
        Dritter beachtet und entsprechende Inhalte als solche gekennzeichnet.
      </p>

      <h2>7. Haftungsbeschränkung</h2>
      <h3>a) Eigene Inhalte</h3>
      <p>
        Wir haften für eigene Inhalte auf dieser Website nach den allgemeinen
        Gesetzen. Die Haftung für Schäden, die durch die Nutzung der Informationen auf
        dieser Website entstehen, ist jedoch ausgeschlossen, es sei denn, es liegt ein
        vorsätzliches oder grob fahrlässiges Verhalten vor.
      </p>
      <h3>b) Verfügbarkeit der Website</h3>
      <p>
        Wir bemühen uns, die Website möglichst unterbrechungsfrei zum Abruf
        anzubieten. Trotz aller Sorgfalt können Ausfallzeiten nicht ausgeschlossen
        werden. Wir behalten uns das Recht vor, unser Angebot jederzeit zu ändern oder
        einzustellen.
      </p>

      <h2>8. Änderungen der AGB</h2>
      <p>
        Wir behalten uns vor, diese AGB bei Bedarf zu aktualisieren oder zu ändern, um
        rechtlichen oder technischen Entwicklungen Rechnung zu tragen. Die jeweils
        aktuellen AGB sind jederzeit auf unserer Website einsehbar. Durch die weitere
        Nutzung der Website erklärst du dich mit den geänderten Bedingungen
        einverstanden.
      </p>

      <hr />
      <p className="text-sm">
        © {new Date().getFullYear()} Leckeria · <Link href="/datenschutz">Datenschutz</Link> ·{" "}
        <Link href="/cookies">Cookies</Link> · <Link href="/impressum">Impressum</Link>
      </p>
    </LegalShell>
  );
}
