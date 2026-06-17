import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";

export const metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <LegalShell title="Impressum" intro="Leckeria – Kantinen- und Partyservice">
      <h2>Anschrift</h2>
      <p>
        Leckeria – Kantinen- und Partyservice
        <br />
        Rudolf-Grenzebach-Straße 1
        <br />
        36251 Bad Hersfeld
      </p>

      <h2>Vertreten durch</h2>
      <p>Antje Schuch</p>

      <h2>Kontakt</h2>
      <p>
        Telefon: +49 1515 4722186
        <br />
        E-Mail: info@leckeria-kantine.de
        <br />
        Website: www.leckeria-kantine.de
      </p>

      <h2>Steuerliche Angaben</h2>
      <p>
        <strong>Umsatzsteuer-Identifikationsnummer</strong> gemäß § 27a UStG:
        <br />
        35 722 1529
      </p>

      <h2>Handelsregister</h2>
      <p>
        Eingetragen beim Amtsgericht Bad Hersfeld{" "}
        <em>(Registernummer falls zutreffend)</em>
      </p>

      <h2>Inhaltlich Verantwortlicher</h2>
      <p>
        Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
        <br />
        Leckeria Kantinen- und Partyservice
      </p>

      <h2>Online-Streitbeilegung</h2>
      <p>
        Plattform der EU-Kommission zur Online-Streitbeilegung (OS):
        <br />
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
          https://ec.europa.eu/consumers/odr
        </a>
      </p>
      <p>
        Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren
        vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <hr />
      <p className="text-sm">
        © {new Date().getFullYear()} Leckeria · <Link href="/agb">AGB</Link> ·{" "}
        <Link href="/datenschutz">Datenschutz</Link> · <Link href="/cookies">Cookies</Link>
      </p>
    </LegalShell>
  );
}
