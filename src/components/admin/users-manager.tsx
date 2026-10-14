"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateUserName,
  adminResetUserPassword,
  setUserApproval,
  deleteUser,
} from "@/app/admin/(panel)/admin-users-actions";
import { Pagination, PageRange, usePagination } from "./pagination";

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

type ActionFn = () => Promise<{
  ok?: boolean;
  error?: string;
  resetLink?: string;
  mailSent?: boolean;
  mailError?: string;
}>;

type ResetInfo = {
  id: string;
  link: string;
  mailSent?: boolean;
  mailError?: string;
};

const input =
  "w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

export function UsersManager({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [resetInfo, setResetInfo] = useState<ResetInfo | null>(null);
  const listTop = useRef<HTMLDivElement>(null);

  function run(fn: ActionFn, opts?: { userId?: string }) {
    setFeedback(null);
    startTransition(async () => {
      const res = await fn();
      if (res.error) {
        setFeedback(res.error);
      } else if (res.resetLink && opts?.userId) {
        setResetInfo({
          id: opts.userId,
          link: res.resetLink,
          mailSent: res.mailSent,
          mailError: res.mailError,
        });
        setFeedback(
          res.mailSent
            ? "Reset-Link erstellt und per E-Mail verschickt."
            : "Reset-Link erstellt – E-Mail-Versand fehlgeschlagen (Details unten).",
        );
      } else {
        setFeedback("Gespeichert.");
      }
      router.refresh();
    });
  }

  const q = query.trim().toLowerCase();
  const matches = (u: UserRow) =>
    !q ||
    u.firstName.toLowerCase().includes(q) ||
    u.lastName.toLowerCase().includes(q) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q);

  // Neue Registrierungen: noch nicht freigeschaltet, neueste zuerst.
  // Sobald ein Konto freigeschaltet ist, rutscht es in die alphabetische Liste.
  const newRegistrations = users
    .filter((u) => !u.approved && matches(u))
    .sort((a, b) => b.createdAtTs - a.createdAtTs);
  const approvedUsers = users.filter((u) => u.approved && matches(u));
  const totalNew = users.filter((u) => !u.approved).length;

  // Suche ändert die Treffermenge → immer wieder auf Seite 1
  const paging = usePagination(approvedUsers, { resetKey: q });

  function goToPage(p: number) {
    paging.setPage(p);
    listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const cardProps = {
    pending,
    editingId,
    resetInfo,
    run,
    onEdit: (id: string | null) => {
      setEditingId(id);
      setFeedback(null);
    },
    onCloseReset: () => setResetInfo(null),
  };

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

      {feedback && (
        <p className="mb-3 rounded-xl bg-gold-400/20 px-4 py-2.5 text-sm font-medium text-ink">{feedback}</p>
      )}

      {/* ---- Neue Registrierungen ---- */}
      <section
        aria-labelledby="new-registrations"
        className={`mb-8 rounded-2xl border p-4 ${
          totalNew > 0 ? "border-brand-200 bg-brand-50/50" : "border-dashed border-sand-300 bg-white/60"
        }`}
      >
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="new-registrations" className="flex items-center gap-2 text-base font-bold text-ink">
            Neue Registrierungen
            {totalNew > 0 && (
              <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold tabular-nums text-white">
                {totalNew}
              </span>
            )}
          </h2>
          <p className="text-xs text-ink-soft">
            {totalNew > 0
              ? "Nach dem Freischalten erscheint das Konto in der Liste unten."
              : "Hier erscheinen Konten, die auf Freischaltung warten."}
          </p>
        </div>

        {newRegistrations.length === 0 ? (
          <p className="text-sm text-ink-soft">
            {totalNew === 0 ? "Zurzeit keine neuen Registrierungen." : "Keine neue Registrierung passt zur Suche."}
          </p>
        ) : (
          <div className="space-y-2">
            {newRegistrations.map((u) => (
              <UserCard key={u.id} user={u} {...cardProps} />
            ))}
          </div>
        )}
      </section>

      {/* ---- Freigeschaltete Konten ---- */}
      <div ref={listTop} className="scroll-mt-6">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-base font-bold text-ink">Freigeschaltete Konten</h2>
          <PageRange from={paging.from} to={paging.to} total={paging.total} noun="Konten" />
        </div>

        {approvedUsers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-sand-300 p-6 text-center text-ink-soft">
            {q ? "Keine Mitarbeitenden gefunden." : "Noch keine freigeschalteten Konten."}
          </p>
        ) : (
          <div className="space-y-2">
            {paging.pageItems.map((u) => (
              <UserCard key={u.id} user={u} {...cardProps} />
            ))}
          </div>
        )}

        <Pagination page={paging.page} pageCount={paging.pageCount} total={paging.total} noun="Konten" onChange={goToPage} label="Seiten der Kontenliste" />
      </div>
    </div>
  );
}

/* ---------------- Einzelnes Konto ---------------- */
function UserCard({
  user: u,
  pending,
  editingId,
  resetInfo,
  run,
  onEdit,
  onCloseReset,
}: {
  user: UserRow;
  pending: boolean;
  editingId: string | null;
  resetInfo: ResetInfo | null;
  run: (fn: ActionFn, opts?: { userId?: string }) => void;
  onEdit: (id: string | null) => void;
  onCloseReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-4">
      {editingId === u.id ? (
        <form
          action={(fd) => run(() => updateUserName(u.id, fd).then((r) => (r.ok ? (onEdit(null), r) : r)))}
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
            <button type="button" onClick={() => onEdit(null)} className="rounded-full border border-sand-300 px-4 py-1.5 text-sm">
              Abbrechen
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="flex flex-wrap gap-2 sm:shrink-0">
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
              onClick={() => onEdit(u.id)}
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
          {resetInfo.mailSent ? (
            <p className="mb-2 rounded-lg bg-herb-500/15 px-3 py-2 text-xs font-semibold text-herb-600">
              ✓ E-Mail erfolgreich an {u.email} gesendet.
            </p>
          ) : (
            <p className="mb-2 rounded-lg bg-brand-100 px-3 py-2 text-xs font-semibold text-brand-700">
              ⚠ E-Mail-Versand fehlgeschlagen
              {resetInfo.mailError ? `: ${resetInfo.mailError}` : ""}. Bitte den
              Link unten manuell weiterleiten.
            </p>
          )}
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
              onClick={onCloseReset}
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
  );
}
