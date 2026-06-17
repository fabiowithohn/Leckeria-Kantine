"use client";

import { useEffect, useState } from "react";

export function PlanViewer({ src, title }: { src: string; title?: string | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Vorschau – öffnet das Popup */}
      <button type="button" onClick={() => setOpen(true)} className="group block w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Wochenspeiseplan der Kantine Asteel Flash"
          className="w-full rounded-3xl border border-sand-200 bg-white shadow-warm transition group-hover:shadow-warm-lg"
        />
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M14 10l7-7M10 21H3v-7M3 21l7-7" />
          </svg>
          Zum Vergrößern anklicken
        </p>
      </button>

      {/* Popup / Modal */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Wochenspeiseplan"
          className="fixed inset-0 z-50 flex flex-col bg-ink/80 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="font-extrabold text-white">
                {title ? `Speiseplan ${title}` : "Wochenspeiseplan Asteel Flash"}
              </p>
              <div className="flex gap-2">
                <a
                  href={src}
                  download="asteel-flash-wochenplan.jpg"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-sm font-extrabold text-white shadow-warm transition hover:bg-brand-600"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                  </svg>
                  Herunterladen
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/25"
                >
                  ✕ Schließen
                </button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="Wochenspeiseplan der Kantine Asteel Flash"
                className="h-auto max-h-full w-auto max-w-full rounded-2xl bg-white p-2 shadow-warm-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
