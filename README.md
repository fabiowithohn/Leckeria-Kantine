# Leckeria – Website mit Kantinen-Buchungssystem

Catering- & Kantinen-Website für **Leckeria** (Hessen) mit:

- Öffentlicher Website: Start, Aktuelles, Speisekarte, Partyservice, Kantine, Kontakt
- **Grenzebach-Bestellbereich** (passwortgeschützt): Mitarbeiter-Registrierung mit
  E-Mail-Bestätigung, Login, Online-Bestellung der Tagesgerichte (1 Menü pro Tag,
  Bestellschluss 09:30 Uhr, bis zu eine Woche im Voraus, Stornierung bis Bestellschluss)
- **Admin-Backend** (`/admin`): Gerichte & Speisekarte per Drag & Drop pflegen,
  Bestellungen auswerten (Zusammenfassung + Personenliste + CSV-Export)

## Tech-Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 7 · PostgreSQL
(lokal: embedded-postgres, Produktion: Neon) · Auth.js (NextAuth v5) · Resend · dnd-kit

---

## Lokale Entwicklung

### Voraussetzungen
- Node.js ≥ 20 (auf diesem Rechner liegt eine lokale Installation unter
  `~/.nodejs`; der Pfad wurde in `~/.zshrc` ergänzt – neues Terminal öffnen, dann
  funktionieren `node` und `npm`).

### Einrichtung
```bash
npm install            # Abhängigkeiten + Prisma-Client

# 1) Lokale Datenbank starten (eigenes Terminalfenster offen lassen)
npm run db

# 2) In einem ZWEITEN Terminal: Schema anlegen & Beispieldaten laden
npm run db:migrate     # legt Tabellen an
npm run db:seed        # Demo-Gerichte, Speisekarte, News, Demo-Mitarbeiter

# 3) Dev-Server starten
npm run dev            # http://localhost:3000
```

### Test-Zugänge
- **Admin-Backend** `/admin/login` → Benutzer `admin`, Passwort `bekkster`
- **Demo-Mitarbeiter** `/grenzebach/login` → `demo@grenzebach.test`, Passwort `test1234`

> Ohne `RESEND_API_KEY` läuft alles im **Dev-Modus**: Bestätigungs- und
> Kontakt-E-Mails werden nicht versendet, sondern in die Server-Konsole
> geschrieben (der Bestätigungslink steht dort zum Kopieren).

### Nützliche Skripte
| Befehl | Zweck |
|---|---|
| `npm run db` | Lokale PostgreSQL-Instanz starten |
| `npm run db:migrate` | Prisma-Migration ausführen |
| `npm run db:seed` | Beispieldaten laden |
| `npm run db:studio` | Datenbank im Browser ansehen |
| `npm run build` | Produktions-Build & Typprüfung |

---

## Umgebungsvariablen

Siehe [`.env.example`](./.env.example). Lokal liegt eine vorausgefüllte `.env` bereit.

| Variable | Bedeutung |
|---|---|
| `DATABASE_URL` | PostgreSQL-Verbindung (lokal embedded, sonst Neon) |
| `AUTH_SECRET` | Secret für Sessions (`openssl rand -base64 32`) |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Login des Admin-Backends |
| `NEXT_PUBLIC_APP_URL` | Basis-URL (für Bestätigungslinks) |
| `RESEND_API_KEY` | Resend-API-Key (leer = Dev-Konsolen-Modus) |
| `EMAIL_FROM` | Verifizierte Absenderadresse |
| `CONTACT_TO` | Empfänger der Kontaktformular-Nachrichten |

---

## Deployment (Vercel + Neon)

1. **Neon**: Projekt anlegen, Connection-String (Pooled) kopieren.
2. **Resend**: Account + Absender-Domain verifizieren, API-Key erzeugen.
3. Repository zu **Vercel** importieren und die o.g. Umgebungsvariablen setzen
   (`DATABASE_URL` = Neon-String, sicheres `AUTH_SECRET`, `RESEND_API_KEY`,
   `EMAIL_FROM`, `CONTACT_TO`, `ADMIN_USER`, `ADMIN_PASSWORD`,
   `NEXT_PUBLIC_APP_URL` = Produktions-URL).
4. Migration gegen Neon ausführen: lokal mit auf Neon gesetztem `DATABASE_URL`
   `npx prisma migrate deploy` (und optional `npm run db:seed`).
5. Deployen. `npm run db` wird in Produktion **nicht** benötigt.

> Sicherheitshinweis: Das Admin-Passwort `bekkster` sollte vor dem Live-Gang
> über `ADMIN_PASSWORD` durch ein starkes Passwort ersetzt werden.

---

## Branding (umgesetzt)

- **Farben & Schriften**: zentral in [`src/app/globals.css`](./src/app/globals.css)
  (`@theme`-Block). Leitfarbe Leckeria-Orange `#F97316`, Amber `#FBBF24`,
  Frisch-Grün `#65A30D`, Terra `#C2410C`, Küchen-Schwarz `#1C1917`.
  Schrift **Nunito** (Headlines, 900) / **Nunito Sans** (Fließtext).
- **Logo**: offizielle Wortmarke & Icon (farbig/weiß/schwarz, auf den Inhalt
  zugeschnitten) liegen in [`public/brand/`](./public/brand/) und werden über
  [`src/components/logo.tsx`](./src/components/logo.tsx) eingebunden
  (`<Logo variant="color|white" />`, `<LogoIcon />`).
- **Favicon**: [`src/app/icon.png`](./src/app/icon.png).
- **Fotos**: Im Hero wird das farbige Icon-Logo gezeigt – bei Bedarf durch echte
  Food-Fotos ersetzen ([`src/app/(site)/page.tsx`](<./src/app/(site)/page.tsx>)).
- **Texte / Kontaktdaten**: u.a. in Footer, Impressum, Datenschutz, Kontaktseite.

> Die Originaldateien liegen weiterhin in `logo/` und `favicon/`; die für das Web
> optimierten (zugeschnittenen) Versionen in `public/brand/`.

---

## Projektstruktur (Kurzüberblick)

```
src/
  app/
    (site)/        öffentliche Seiten + Grenzebach-Bestellbereich
    admin/         Admin-Login + (panel)/ geschützte Verwaltung
    api/auth/      NextAuth-Route
  components/      UI- & Admin-Komponenten (Drag & Drop, Formulare)
  lib/             db, auth, admin-auth, mail, time, format
prisma/            schema.prisma, seed.ts, migrations/
scripts/           local-db.mjs (embedded-postgres)
```
