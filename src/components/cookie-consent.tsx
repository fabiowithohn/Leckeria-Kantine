"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "leckeria-cookie-consent";
const CONSENT_VERSION = 1;

type Prefs = { functional: boolean; analytics: boolean; marketing: boolean };

const CATEGORIES: {
  key: keyof Prefs;
  title: string;
  text: string;
}[] = [
  {
    key: "functional",
    title: "Funktionale Cookies",
    text: "Speichern deine Einstellungen und Vorlieben (z. B. Sprache oder Layout).",
  },
  {
    key: "analytics",
    title: "Analyse & Statistik",
    text: "Helfen uns anonym zu verstehen, wie die Website genutzt wird.",
  },
  {
    key: "marketing",
    title: "Marketing & Tracking",
    text: "Ermöglichen relevante Inhalte und die Erfolgsmessung von Kampagnen.",
  },
];

/** Banner-Einblendung für die Cookie-Einwilligung im Leckeria-Stil. */
export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({
    functional: false,
    analytics: false,
    marketing: false,
  });

  // Beim ersten Rendern prüfen, ob bereits eine Einwilligung vorliegt.
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setOpen(true);
        return;
      }
      const saved = JSON.parse(raw);
      if (saved?.version !== CONSENT_VERSION) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  // Erlaubt das erneute Öffnen, z. B. über den Footer-Link "Cookie-Einstellungen".
  useEffect(() => {
    function reopen() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          setPrefs({
            functional: !!saved.functional,
            analytics: !!saved.analytics,
            marketing: !!saved.marketing,
          });
        }
      } catch {
        /* ignore */
      }
      setShowSettings(true);
      setOpen(true);
    }
    window.addEventListener("open-cookie-settings", reopen);
    return () => window.removeEventListener("open-cookie-settings", reopen);
  }, []);

  function persist(p: Prefs) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: CONSENT_VERSION,
          necessary: true,
          ...p,
          ts: new Date().toISOString(),
        }),
      );
    } catch {
      /* ignore */
    }
    setOpen(false);
    setShowSettings(false);
  }

  const acceptAll = () =>
    persist({ functional: true, analytics: true, marketing: true });
  const acceptNecessary = () =>
    persist({ functional: false, analytics: false, marketing: false });
  const saveSelection = () => persist(prefs);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-label="Cookie-Einwilligung"
          initial={{ y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 48, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6"
        >
          <div className="mx-auto max-w-3xl rounded-3xl border border-sand-200 bg-white/95 p-6 shadow-warm-lg backdrop-blur-md sm:p-7">
            <div className="flex items-start gap-4">
              <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-2xl sm:grid">
                🍪
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-ink">
                  Wir verwenden Cookies
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  Einige Cookies sind technisch notwendig, andere helfen uns,
                  die Website zu verbessern und dir relevante Inhalte zu zeigen.
                  Du entscheidest selbst. Mehr dazu im{" "}
                  <Link href="/cookies" className="font-semibold text-brand-600 underline">
                    Cookie-Hinweis
                  </Link>{" "}
                  und in der{" "}
                  <Link href="/datenschutz" className="font-semibold text-brand-600 underline">
                    Datenschutzerklärung
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Detaillierte Einstellungen */}
            <AnimatePresence initial={false}>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 space-y-3">
                    {/* Notwendig – immer aktiv */}
                    <div className="flex items-start justify-between gap-4 rounded-2xl border border-sand-200 bg-sand-50 p-4">
                      <div>
                        <p className="text-sm font-bold text-ink">
                          Notwendige Cookies
                        </p>
                        <p className="mt-0.5 text-sm text-ink-soft">
                          Für den sicheren Betrieb der Website unerlässlich –
                          immer aktiv.
                        </p>
                      </div>
                      <span className="mt-0.5 shrink-0 rounded-full bg-herb-500/15 px-3 py-1 text-xs font-extrabold text-herb-600">
                        Immer an
                      </span>
                    </div>

                    {CATEGORIES.map((c) => (
                      <label
                        key={c.key}
                        className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-sand-200 bg-white p-4"
                      >
                        <div>
                          <p className="text-sm font-bold text-ink">{c.title}</p>
                          <p className="mt-0.5 text-sm text-ink-soft">{c.text}</p>
                        </div>
                        <Toggle
                          checked={prefs[c.key]}
                          onChange={(v) =>
                            setPrefs((prev) => ({ ...prev, [c.key]: v }))
                          }
                          label={c.title}
                        />
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Aktionen */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              {!showSettings ? (
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="order-3 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-extrabold text-ink-soft transition hover:bg-sand-100 sm:order-1 sm:mr-auto"
                >
                  Einstellungen
                </button>
              ) : (
                <button
                  type="button"
                  onClick={saveSelection}
                  className="order-3 inline-flex items-center justify-center rounded-full border-2 border-brand-500 px-5 py-3 text-sm font-extrabold text-brand-700 transition hover:bg-brand-50 sm:order-1 sm:mr-auto"
                >
                  Auswahl speichern
                </button>
              )}

              <button
                type="button"
                onClick={acceptNecessary}
                className="order-2 inline-flex items-center justify-center rounded-full border-2 border-sand-300 px-5 py-3 text-sm font-extrabold text-ink transition hover:bg-sand-100"
              >
                Nur notwendige
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="order-1 inline-flex items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-extrabold text-white shadow-warm transition hover:bg-brand-600 sm:order-3"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        checked ? "bg-brand-500" : "bg-sand-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/** Footer-Link zum erneuten Öffnen der Cookie-Einstellungen. */
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
      className={className}
    >
      Cookie-Einstellungen
    </button>
  );
}
