import { Container } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";

export const metadata = { title: "Kontakt" };

export default function KontaktPage() {
  return (
    <div className="py-16">
      <Container className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-600">
            Kontakt
          </p>
          <h1 className="text-4xl font-black text-ink">Sprich mit uns</h1>
          <p className="mt-4 text-lg text-ink-soft">
            Du hast Fragen zu Catering, Partyservice oder unseren Kantinen?
            Schreib uns – wir freuen uns auf deine Nachricht.
          </p>

          <dl className="mt-8 space-y-4 text-ink">
            <div>
              <dt className="text-sm font-semibold text-brand-600">Adresse</dt>
              <dd>
                Leckeria – Kantinen- und Partyservice
                <br />
                Rudolf-Grenzebach-Straße 1
                <br />
                36251 Bad Hersfeld
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-brand-600">Telefon</dt>
              <dd>
                <a href="tel:+4915154722186" className="hover:text-brand-700">
                  +49 1515 4722186
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-brand-600">E-Mail</dt>
              <dd>
                <a href="mailto:info@leckeria-kantine.de" className="hover:text-brand-700">
                  info@leckeria-kantine.de
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-sand-200 bg-white p-8 shadow-sm">
          <ContactForm />
        </div>
      </Container>
    </div>
  );
}
