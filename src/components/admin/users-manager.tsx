"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateUserName,
  adminResetUserPassword,
  setUserApproval,
  deleteUser,
} from "@/app/admin/(panel)/admin-users-actions";

export type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  verified: boolean;
  approved: boolean;
  createdAt: string;
  createdAtTs: number;
};

const input =
  "w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

export function UsersManager({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [resetInfo, setResetInfo] = useState<{ id: string; link: string } | null>(null);

  function run(fn: () => Promise<{ ok?: boolean; error?: string; resetLink?: string }>, opts?: { userId?: string }) {
    setFeedback(null);
    startTransition(async () => {
      const res = await fn();
      if (res.error) {
        setFeedback(res.error);
      } else if (res.resetLink && opts?.userId) {
        setResetInfo({ id: opts.userId, link: res.resetLink });
        setFeedback("Reset-Link erstellt und (falls Mailversand aktiv) per E-Mail verschickt.");
      } else {
        setFeedback("Gespeichert.");
      }
      router.refresh();
    });
  }

  // Konten, die ihre E-Mail bestätigt haben, aber noch auf Freischaltung warten
  const pendingCount = users.filter((u) => u.verified && !u.approved).length;

  const q = query.trim().toLowerCase();
  const filtered = users.filter((u) => {
    if (!q) return true;
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-3 rounded-2xl border border-sand-200 bg-white p-3">
        <label className="mb-1 block text-xs font-semibold text-ink-soft">Suche (Vor-/Nachname oder E-Mail)</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="z. B. Stölting oder rebekka@…"
          className={input}
        />
      </div>

      {pendingCount > 0 && (
        <p className="mb-3 rounded-xl bg-brand-100 px-4 py-3 text-sm font-medium text-brand-700">
          {pendingCount} {pendingCount === 1 ? "Konto wartet" : "Konten warten"} auf
          deine Freischaltung.
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="text-sm text-ink-soft">
          {filtered.length} von {users.length} Konten angezeigt
        </p>
        {feedback && (
          <span className="rounded-xl bg-gold-400/20 px-4 py-2 text-sm font-medium text-ink">
            {feedback}
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-sand-300 p-6 text-center text-ink-soft">
          Keine Mitarbeitenden gefunden.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className="rounded-2xl border border-sand-200 bg-white p-4">
              {editingId === u.id ? (
                <form
                  action={(fd) =>
                    run(() => updateUserName(u.id, fd).then((r) => (r.ok ? (setEditingId(null), r) : r)))
                  }
                  className="grid gap-2 sm:grid-cols-2"
                >
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink-soft">Vorname</label>
                    <input name="firstName" defaultValue={u.firstName} className={input} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-ink-soft">Nachname</label>
                    <input name="lastName" defaultValue={u.lastName} className={input} />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <button disabled={pending} className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-bold text-white shadow-warm disabled:opacity-60">
                      Speichern
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="rounded-full border border-sand-300 px-4 py-1.5 text-sm">
                      Abbrechen
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-ink">
                      {u.firstName} {u.lastName}
                      {!u.verified ? (
                        <span className="ml-2 rounded-full bg-gold-400/20 px-2 py-0.5 text-xs font-semibold text-ink-soft">
                          E-Mail unbestätigt
                        </span>
                      ) : !u.approved ? (
                        <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                          wartet auf Freischaltung
                        </span>
                      ) : (
                        <span className="ml-2 rounded-full bg-herb-500/15 px-2 py-0.5 text-xs font-semibold text-herb-600">
                          freigeschaltet
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-ink-soft">{u.email}</p>
                    <p className="text-xs text-ink-soft">registriert am {u.createdAt}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {u.approved ? (
                      <button
                        onClick={() => {
                          if (confirm(`Freischaltung von „${u.firstName} ${u.lastName}“ entziehen? Der Login wird damit gesperrt.`)) {
                            run(() => setUserApproval(u.id, false));
                          }
                        }}
                        className="rounded-full border border-sand-300 px-3 py-1 text-xs font-semibold text-ink-soft hover:bg-sand-100"
                      >
                        Sperren
                      </button>
                    ) : (
                      <button
                        onClick={() => run(() => setUserApproval(u.id, true))}
                        className="rounded-full bg-herb-500 px-3 py-1 text-xs font-bold text-white shadow-warm hover:bg-herb-600"
                      >
                        Freischalten
                      </button>
                    )}
                    <button
                      onClick={() => { setEditingId(u.id); setFeedback(null); }}
                      className="rounded-full border border-sand-300 px-3 py-1 text-xs font-semibold hover:bg-sand-100"
                    >
                      Name bearbeiten
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Passwort von „${u.firstName} ${u.lastName}“ zurücksetzen? Es wird ein Reset-Link erzeugt.`)) {
                          run(() => adminResetUserPassword(u.id), { userId: u.id });
                        }
                      }}
                      className="rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                    >
                      Passwort zurücksetzen
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Konto von „${u.firstName} ${u.lastName}“ (${u.email}) endgültig löschen? Das kann nicht rückgängig gemacht werden.`)) {
                          run(() => deleteUser(u.id));
                        }
                      }}
                      className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white hover:bg-brand-700"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              )}

              {resetInfo?.id === u.id && (
                <div className="mt-3 rounded-xl border border-herb-500/30 bg-herb-500/10 p-3 text-sm">
                  <p className="font-semibold text-ink">Reset-Link (1 Stunde gültig):</p>
                  <p className="mt-1 break-all text-ink-soft">{resetInfo.link}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(resetInfo.link)}
                      className="rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white"
                    >
                      Link kopieren
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetInfo(null)}
                      className="rounded-full border border-sand-300 px-3 py-1 text-xs"
                    >
                      Schließen
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-ink-soft">
                    Der Link wurde dem Mitarbeiter per E-Mail gesendet (falls Mailversand
                    aktiv). Du kannst ihn alternativ kopieren und manuell weiterleiten.
                    Der Mitarbeiter vergibt darüber selbst ein neues Passwort.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
