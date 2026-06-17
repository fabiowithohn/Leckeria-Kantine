"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SortableList, SortableRow } from "./sortable-list";
import { formatPrice } from "@/lib/format";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemActive,
  reorderMenuItems,
} from "@/app/admin/(panel)/admin-data-actions";

export type AdminMenuDTO = {
  id: string;
  section: string;
  title: string;
  description: string | null;
  priceCents: number | null;
  active: boolean;
};

const input =
  "w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

function centsToInput(cents: number | null): string {
  return cents == null ? "" : (cents / 100).toFixed(2).replace(".", ",");
}

export function MenuManager({ items: initial }: { items: AdminMenuDTO[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState(initial);

  useEffect(() => setItems(initial), [initial]);

  function act(fn: () => Promise<{ ok?: boolean; error?: string }>) {
    startTransition(async () => {
      const res = await fn();
      setFeedback(res.error ?? null);
      router.refresh();
    });
  }

  function handleReorder(ids: string[]) {
    setItems((prev) => ids.map((id) => prev.find((d) => d.id === id)!).filter(Boolean));
    startTransition(async () => {
      await reorderMenuItems(ids);
      router.refresh();
    });
  }

  return (
    <div>
      {feedback && (
        <p className="mb-4 rounded-xl bg-gold-400/20 px-4 py-3 text-sm font-medium text-ink">{feedback}</p>
      )}
      <p className="mb-3 text-sm text-ink-soft">
        Reihenfolge per <strong>⠿ ziehen</strong>. Gerichte mit gleichem
        Abschnitt werden auf der Website unter dieser Überschrift gruppiert.
      </p>

      {items.length === 0 ? (
        <p className="mb-4 rounded-xl border border-dashed border-sand-300 p-6 text-center text-ink-soft">
          Noch keine Einträge.
        </p>
      ) : (
        <SortableList ids={items.map((i) => i.id)} onReorder={handleReorder}>
          {items.map((item) =>
            editingId === item.id ? (
              <SortableRow key={item.id} id={item.id}>
                <form
                  action={(fd) => act(() => updateMenuItem(item.id, fd).then((r) => (setEditingId(null), r)))}
                  className="grid gap-2 sm:grid-cols-2"
                >
                  <input name="section" defaultValue={item.section} placeholder="Abschnitt" className={input} />
                  <input name="price" defaultValue={centsToInput(item.priceCents)} placeholder="Preis z.B. 9,80" className={input} />
                  <input name="title" defaultValue={item.title} placeholder="Titel" className={`${input} sm:col-span-2`} />
                  <input name="description" defaultValue={item.description ?? ""} placeholder="Beschreibung" className={`${input} sm:col-span-2`} />
                  <div className="flex gap-2 sm:col-span-2">
                    <button disabled={pending} className="rounded-full bg-brand-700 px-4 py-1.5 text-sm font-semibold text-sand-50">Speichern</button>
                    <button type="button" onClick={() => setEditingId(null)} className="rounded-full border border-sand-300 px-4 py-1.5 text-sm">Abbrechen</button>
                  </div>
                </form>
              </SortableRow>
            ) : (
              <SortableRow key={item.id} id={item.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{item.section}</p>
                    <p className={`font-semibold ${item.active ? "text-ink" : "text-ink-soft line-through"}`}>
                      {item.title}
                      {item.priceCents != null && (
                        <span className="ml-2 font-normal text-brand-700">{formatPrice(item.priceCents)}</span>
                      )}
                    </p>
                    {item.description && <p className="text-sm text-ink-soft">{item.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => act(() => toggleMenuItemActive(item.id, !item.active))}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.active ? "bg-herb-500/15 text-herb-600" : "bg-sand-200 text-ink-soft"
                      }`}
                    >
                      {item.active ? "sichtbar" : "verborgen"}
                    </button>
                    <button onClick={() => setEditingId(item.id)} className="rounded-full border border-sand-300 px-3 py-1 text-xs hover:bg-sand-100">Bearbeiten</button>
                    <button
                      onClick={() => { if (confirm(`„${item.title}“ löschen?`)) act(() => deleteMenuItem(item.id)); }}
                      className="rounded-full border border-brand-200 px-3 py-1 text-xs text-brand-700 hover:bg-brand-50"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              </SortableRow>
            ),
          )}
        </SortableList>
      )}

      <form
        action={(fd) => {
          startTransition(async () => {
            const res = await createMenuItem({}, fd);
            setFeedback(res.error ?? null);
            if (res.ok && !res.error) {
              (document.getElementById("add-menu") as HTMLFormElement)?.reset();
              router.refresh();
            }
          });
        }}
        id="add-menu"
        className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 p-4"
      >
        <p className="mb-3 text-sm font-semibold text-ink">Neuen Eintrag hinzufügen</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input name="section" placeholder="Abschnitt * (z.B. Hauptgerichte)" required className={input} />
          <input name="price" placeholder="Preis z.B. 9,80" className={input} />
          <input name="title" placeholder="Titel *" required className={`${input} sm:col-span-2`} />
          <input name="description" placeholder="Beschreibung" className={`${input} sm:col-span-2`} />
        </div>
        <button disabled={pending} className="mt-3 rounded-full bg-brand-700 px-5 py-2 text-sm font-semibold text-sand-50 disabled:opacity-60">
          {pending ? "Speichern …" : "Hinzufügen"}
        </button>
      </form>
    </div>
  );
}
