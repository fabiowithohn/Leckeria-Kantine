"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SortableList, SortableRow } from "./sortable-list";
import { ALLERGENS, ADDITIVES } from "@/lib/allergens";
import { MarkIcon } from "@/components/mark-icon";
import {
  createLibraryDish,
  updateLibraryDish,
  deleteLibraryDish,
  removeLibraryDishImage,
  assignDishToSlot,
  unassignDish,
  toggleAssignmentActive,
  reorderSlot,
} from "@/app/admin/(panel)/admin-data-actions";

export type LibDish = {
  id: string;
  title: string;
  description: string | null;
  allergens: string[];
  additives: string[];
  hasImage: boolean;
  imageVersion: string;
  slots: string[];
};

export type SlotItem = {
  assignmentId: string;
  dishId: string;
  title: string;
  description: string | null;
  hasImage: boolean;
  imageVersion: string;
  active: boolean;
};

type SlotDef = { key: string; label: string };

type Props = {
  library: LibDish[];
  slots: SlotDef[];
  slotItems: Record<string, SlotItem[]>;
};

const input =
  "w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

const SLOT_SHORT: Record<string, string> = {
  DAILY_FIXED: "Täglich",
  MON: "Mo",
  TUE: "Di",
  WED: "Mi",
  THU: "Do",
  FRI: "Fr",
};

function Thumb({ dishId, hasImage, version }: { dishId: string; hasImage: boolean; version: string }) {
  if (hasImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={`/api/dish-image/${dishId}?v=${encodeURIComponent(version)}`}
        alt=""
        className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-sand-200"
      />
    );
  }
  return (
    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-sand-100 text-ink-soft">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 5h16v14H4zM4 15l4-4 4 4M14 13l2-2 4 4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="9" r="1.4" />
      </svg>
    </div>
  );
}

/** Checkbox-Auswahl der Allergene (Name="allergens", Werte = Nummern 1–14). */
function AllergenPicker({ selected = [] }: { selected?: string[] }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-ink-soft">Enthaltene Allergene</p>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {ALLERGENS.map((a) => (
          <label
            key={a.nr}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-sand-200 bg-white px-2.5 py-1.5 text-sm text-ink hover:bg-sand-50 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50"
          >
            <input
              type="checkbox"
              name="allergens"
              value={a.nr}
              defaultChecked={selected.includes(a.nr)}
              className="h-4 w-4 shrink-0 accent-brand-500"
            />
            <MarkIcon path={a.iconPath} className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">
              <span className="text-ink-soft">{a.nr}</span> {a.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

/** Checkbox-Auswahl der Zusatzstoffe (Name="additives", Werte = Kürzel a–m). */
function AdditivePicker({ selected = [] }: { selected?: string[] }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-ink-soft">Kennzeichnungspflichtige Zusatzstoffe</p>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {ADDITIVES.map((a) => (
          <label
            key={a.code}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-sand-200 bg-white px-2.5 py-1.5 text-sm text-ink hover:bg-sand-50 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50"
          >
            <input
              type="checkbox"
              name="additives"
              value={a.code}
              defaultChecked={selected.includes(a.code)}
              className="h-4 w-4 shrink-0 accent-brand-500"
            />
            <MarkIcon path={a.iconPath} className="h-4 w-4 shrink-0 text-ink-soft" />
            <span className="truncate">
              <span className="text-ink-soft">{a.code})</span> {a.category}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function GrenzebachManager({ library, slots, slotItems }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState("BIBLIOTHEK");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function act(fn: () => Promise<{ ok?: boolean; error?: string }>) {
    startTransition(async () => {
      const res = await fn();
      setFeedback(res.error ?? null);
      router.refresh();
    });
  }

  const tabs = [{ key: "BIBLIOTHEK", label: "Bibliothek" }, ...slots];

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setFeedback(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              t.key === tab ? "bg-brand-500 text-white shadow-warm" : "bg-white text-ink hover:bg-sand-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {feedback && (
        <p className="mb-4 rounded-xl bg-gold-400/20 px-4 py-3 text-sm font-medium text-ink">{feedback}</p>
      )}

      {tab === "BIBLIOTHEK" ? (
        <LibraryTab library={library} act={act} pending={pending} onDone={() => router.refresh()} />
      ) : (
        <SlotTab
          key={tab}
          slot={tab}
          slotLabel={tabs.find((t) => t.key === tab)?.label ?? ""}
          items={slotItems[tab] ?? []}
          library={library}
          act={act}
          pending={pending}
        />
      )}
    </div>
  );
}

/* ---------------- Bibliothek ---------------- */
function LibraryTab({
  library,
  act,
  pending,
  onDone,
}: {
  library: LibDish[];
  act: (fn: () => Promise<{ ok?: boolean; error?: string }>) => void;
  pending: boolean;
  onDone: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <p className="mb-4 text-sm text-ink-soft">
        Lege hier jedes Gericht <strong>einmal</strong> an. Anschließend kannst du
        es in den Wochentags-Reitern beliebig vielen Tagen zuordnen – ohne es
        erneut anzulegen.
      </p>

      {library.length === 0 ? (
        <p className="mb-4 rounded-xl border border-dashed border-sand-300 p-6 text-center text-ink-soft">
          Die Bibliothek ist noch leer.
        </p>
      ) : (
        <div className="space-y-2">
          {library.map((dish) =>
            editingId === dish.id ? (
              <div key={dish.id} className="rounded-2xl border border-sand-200 bg-white p-4">
                <form
                  action={(fd) => act(() => updateLibraryDish(dish.id, fd).then((r) => (setEditingId(null), r)))}
                  className="grid gap-2"
                >
                  <input name="title" defaultValue={dish.title} placeholder="Titel" className={input} />
                  <input name="description" defaultValue={dish.description ?? ""} placeholder="Beschreibung" className={input} />
                  <AllergenPicker selected={dish.allergens} />
                  <AdditivePicker selected={dish.additives} />
                  <div className="flex items-center gap-3">
                    <Thumb dishId={dish.id} hasImage={dish.hasImage} version={dish.imageVersion} />
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-semibold text-ink-soft">Bild ersetzen (optional)</label>
                      <input type="file" name="image" accept="image/*" className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-brand-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand-700" />
                    </div>
                    {dish.hasImage && (
                      <button type="button" onClick={() => act(() => removeLibraryDishImage(dish.id))} className="rounded-full border border-brand-200 px-3 py-1 text-xs text-brand-700 hover:bg-brand-50">
                        Bild entfernen
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button disabled={pending} className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-bold text-white shadow-warm">Speichern</button>
                    <button type="button" onClick={() => setEditingId(null)} className="rounded-full border border-sand-300 px-4 py-1.5 text-sm">Abbrechen</button>
                  </div>
                </form>
              </div>
            ) : (
              <div key={dish.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <Thumb dishId={dish.id} hasImage={dish.hasImage} version={dish.imageVersion} />
                  <div>
                    <p className="font-bold text-ink">{dish.title}</p>
                    {dish.description && <p className="text-sm text-ink-soft">{dish.description}</p>}
                    {dish.allergens.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-ink-soft" aria-label={`Allergene: ${dish.allergens.join(", ")}`}>
                        {ALLERGENS.filter((a) => dish.allergens.includes(a.nr)).map((a) => (
                          <span key={a.nr} title={`${a.nr} – ${a.name}`} className="inline-flex items-center gap-1 text-xs font-semibold">
                            <MarkIcon path={a.iconPath} className="h-4 w-4" />
                            {a.nr}
                          </span>
                        ))}
                      </div>
                    )}
                    {dish.additives.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-ink-soft" aria-label={`Zusatzstoffe: ${dish.additives.join(", ")}`}>
                        {ADDITIVES.filter((a) => dish.additives.includes(a.code)).map((a) => (
                          <span key={a.code} title={`${a.code} – ${a.category}`} className="inline-flex items-center gap-1 text-xs font-semibold">
                            <MarkIcon path={a.iconPath} className="h-4 w-4" />
                            {a.code}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 flex flex-wrap gap-1">
                      {dish.slots.length === 0 ? (
                        <span className="text-xs text-ink-soft">keinem Tag zugeordnet</span>
                      ) : (
                        dish.slots.map((s) => (
                          <span key={s} className="rounded-full bg-herb-500/15 px-2 py-0.5 text-xs font-semibold text-herb-600">
                            {SLOT_SHORT[s] ?? s}
                          </span>
                        ))
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingId(dish.id)} className="rounded-full border border-sand-300 px-3 py-1 text-xs hover:bg-sand-100">Bearbeiten</button>
                  <button
                    onClick={() => { if (confirm(`„${dish.title}“ aus der Bibliothek löschen?`)) act(() => deleteLibraryDish(dish.id)); }}
                    className="rounded-full border border-brand-200 px-3 py-1 text-xs text-brand-700 hover:bg-brand-50"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* Neues Gericht in die Bibliothek */}
      <form
        action={(fd) => {
          act(async () => {
            const res = await createLibraryDish({}, fd);
            if (res.ok && !res.error) {
              (document.getElementById("add-lib-dish") as HTMLFormElement)?.reset();
              onDone();
            }
            return res;
          });
        }}
        id="add-lib-dish"
        className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 p-4"
      >
        <p className="mb-3 text-sm font-bold text-ink">Neues Gericht zur Bibliothek hinzufügen</p>
        <div className="grid gap-2">
          <input name="title" placeholder="Titel *" required className={input} />
          <input name="description" placeholder="Beschreibung" className={input} />
          <AllergenPicker />
          <AdditivePicker />
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-soft">Vorschaubild (optional)</label>
            <input type="file" name="image" accept="image/*" className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-brand-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand-700" />
          </div>
        </div>
        <button disabled={pending} className="mt-3 rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white shadow-warm disabled:opacity-60">
          {pending ? "Speichern …" : "Zur Bibliothek hinzufügen"}
        </button>
      </form>
    </div>
  );
}

/* ---------------- Slot (Wochentag / Täglich) ---------------- */
function SlotTab({
  slot,
  slotLabel,
  items,
  library,
  act,
  pending,
}: {
  slot: string;
  slotLabel: string;
  items: SlotItem[];
  library: LibDish[];
  act: (fn: () => Promise<{ ok?: boolean; error?: string }>) => void;
  pending: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [local, setLocal] = useState(items);
  const [pick, setPick] = useState("");

  useEffect(() => setLocal(items), [items]);

  const available = library.filter((d) => !d.slots.includes(slot));

  function handleReorder(ids: string[]) {
    setLocal((prev) => ids.map((id) => prev.find((i) => i.assignmentId === id)!).filter(Boolean));
    startTransition(async () => {
      await reorderSlot(ids);
      router.refresh();
    });
  }

  return (
    <div>
      <p className="mb-4 text-sm text-ink-soft">
        Gerichte für <strong>{slotLabel}</strong>. Reihenfolge per <strong>⠿ ziehen</strong>.
        Inaktive sind im Bestellbereich ausgeblendet.
      </p>

      {/* Aus Bibliothek hinzufügen */}
      <div className="mb-5 flex flex-wrap items-end gap-2 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 p-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-bold text-ink">Aus Bibliothek hinzufügen</label>
          <select value={pick} onChange={(e) => setPick(e.target.value)} className={input}>
            <option value="">– Gericht wählen –</option>
            {available.map((d) => (
              <option key={d.id} value={d.id}>
                {d.description ? `${d.title} – ${d.description}` : d.title}
              </option>
            ))}
          </select>
        </div>
        <button
          disabled={pending || !pick}
          onClick={() => {
            if (!pick) return;
            act(() => assignDishToSlot(pick, slot));
            setPick("");
          }}
          className="rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white shadow-warm disabled:opacity-50"
        >
          Hinzufügen
        </button>
      </div>

      {local.length === 0 ? (
        <p className="rounded-xl border border-dashed border-sand-300 p-6 text-center text-ink-soft">
          Diesem Tag sind noch keine Gerichte zugeordnet.
        </p>
      ) : (
        <SortableList ids={local.map((i) => i.assignmentId)} onReorder={handleReorder}>
          {local.map((item) => (
            <SortableRow key={item.assignmentId} id={item.assignmentId}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Thumb dishId={item.dishId} hasImage={item.hasImage} version={item.imageVersion} />
                  <div className="min-w-0">
                    <p className={`font-bold ${item.active ? "text-ink" : "text-ink-soft line-through"}`}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-sm text-ink-soft">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => act(() => toggleAssignmentActive(item.assignmentId, !item.active))}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.active ? "bg-herb-500/15 text-herb-600" : "bg-sand-200 text-ink-soft"
                    }`}
                  >
                    {item.active ? "aktiv" : "inaktiv"}
                  </button>
                  <button
                    onClick={() => act(() => unassignDish(item.assignmentId))}
                    className="rounded-full border border-brand-200 px-3 py-1 text-xs text-brand-700 hover:bg-brand-50"
                  >
                    Entfernen
                  </button>
                </div>
              </div>
            </SortableRow>
          ))}
        </SortableList>
      )}
    </div>
  );
}
