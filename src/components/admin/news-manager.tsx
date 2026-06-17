"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageDropzone } from "./image-dropzone";
import {
  createNews,
  updateNews,
  deleteNews,
  toggleNewsPublished,
  updateNewsImage,
  removeNewsImage,
} from "@/app/admin/(panel)/admin-data-actions";

export type AdminNewsDTO = {
  id: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt: string;
  hasImage: boolean;
  imageVersion: string;
};

const input =
  "w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

export function NewsManager({ posts }: { posts: AdminNewsDTO[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0); // remountet das Dropzone-Feld nach dem Anlegen
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  function act(fn: () => Promise<{ ok?: boolean; error?: string }>) {
    startTransition(async () => {
      try {
        const res = await fn();
        setError(res?.error ?? null);
      } catch {
        setError("Aktion fehlgeschlagen – das Bild ist möglicherweise zu groß. Bitte ein kleineres Bild verwenden.");
      }
      router.refresh();
    });
  }

  function imageSrc(post: AdminNewsDTO) {
    return `/api/news-image/${post.id}?v=${encodeURIComponent(post.imageVersion)}`;
  }

  return (
    <div>
      <form
        action={(fd) => {
          startTransition(async () => {
            try {
              const res = await createNews({}, fd);
              setError(res.error ?? null);
              if (res.ok && !res.error) {
                (document.getElementById("add-news") as HTMLFormElement)?.reset();
                setFormKey((k) => k + 1);
                router.refresh();
              }
            } catch {
              setError("Beitrag konnte nicht gespeichert werden – das Bild ist möglicherweise zu groß. Bitte ein kleineres Bild verwenden.");
            }
          });
        }}
        id="add-news"
        className="mb-8 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 p-4"
      >
        <p className="mb-3 text-sm font-semibold text-ink">Neuen Beitrag erstellen</p>
        {error && <p className="mb-2 text-sm font-medium text-brand-700">{error}</p>}
        <div className="space-y-2">
          <input name="title" placeholder="Titel *" required className={input} />
          <textarea name="body" placeholder="Text *" required rows={3} className={input} />
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-soft">Beitragsbild (optional)</label>
            <ImageDropzone key={formKey} />
          </div>
        </div>
        <button disabled={pending} className="mt-3 rounded-full bg-brand-700 px-5 py-2 text-sm font-semibold text-sand-50 disabled:opacity-60">
          {pending ? "Speichern …" : "Veröffentlichen"}
        </button>
      </form>

      {posts.length === 0 ? (
        <p className="text-ink-soft">Noch keine Beiträge.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-2xl border border-sand-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-1 items-start gap-3">
                  {post.hasImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageSrc(post)} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-sand-200" />
                  ) : (
                    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-sand-100 text-ink-soft">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 5h16v14H4zM4 15l4-4 4 4M14 13l2-2 4 4" />
                        <circle cx="9" cy="9" r="1.4" />
                      </svg>
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    {editingId === post.id ? (
                      <form
                        action={(fd) =>
                          act(() => updateNews(post.id, fd).then((r) => (r.ok ? (setEditingId(null), r) : r)))
                        }
                        className="space-y-2"
                      >
                        <input name="title" defaultValue={post.title} placeholder="Titel *" required className={input} />
                        <textarea name="body" defaultValue={post.body} placeholder="Text *" required rows={3} className={input} />
                        <div className="flex gap-2">
                          <button disabled={pending} className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-bold text-white shadow-warm disabled:opacity-60">
                            Speichern
                          </button>
                          <button type="button" onClick={() => setEditingId(null)} className="rounded-full border border-sand-300 px-4 py-1.5 text-sm">
                            Abbrechen
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className={`font-semibold ${post.published ? "text-ink" : "text-ink-soft"}`}>{post.title}</p>
                        <p className="text-sm text-ink-soft">{post.body}</p>
                        <p className="mt-1 text-xs text-ink-soft">{post.publishedAt}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => { setEditingId(editingId === post.id ? null : post.id); setEditingImageId(null); setError(null); }}
                    className="rounded-full border border-sand-300 px-3 py-1 text-xs font-semibold hover:bg-sand-100"
                  >
                    {editingId === post.id ? "Schließen" : "Bearbeiten"}
                  </button>
                  <button
                    onClick={() => { setEditingImageId(editingImageId === post.id ? null : post.id); setEditingId(null); setError(null); }}
                    className="rounded-full border border-sand-300 px-3 py-1 text-xs font-semibold hover:bg-sand-100"
                  >
                    {post.hasImage ? "Bild ändern" : "Bild hinzufügen"}
                  </button>
                  <button
                    onClick={() => act(() => toggleNewsPublished(post.id, !post.published))}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      post.published ? "bg-herb-500/15 text-herb-600" : "bg-sand-200 text-ink-soft"
                    }`}
                  >
                    {post.published ? "veröffentlicht" : "entwurf"}
                  </button>
                  <button
                    onClick={() => { if (confirm(`„${post.title}“ löschen?`)) act(() => deleteNews(post.id)); }}
                    className="rounded-full border border-brand-200 px-3 py-1 text-xs text-brand-700 hover:bg-brand-50"
                  >
                    Löschen
                  </button>
                </div>
              </div>

              {editingImageId === post.id && (
                <form
                  action={(fd) =>
                    act(() => updateNewsImage(post.id, fd).then((r) => (r.ok ? (setEditingImageId(null), r) : r)))
                  }
                  className="mt-3 border-t border-sand-200 pt-3"
                >
                  <ImageDropzone existingSrc={post.hasImage ? imageSrc(post) : undefined} />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button disabled={pending} className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-bold text-white shadow-warm disabled:opacity-60">
                      Bild speichern
                    </button>
                    {post.hasImage && (
                      <button
                        type="button"
                        onClick={() => { setEditingImageId(null); act(() => removeNewsImage(post.id)); }}
                        className="rounded-full border border-brand-200 px-4 py-1.5 text-sm text-brand-700 hover:bg-brand-50"
                      >
                        Bild entfernen
                      </button>
                    )}
                    <button type="button" onClick={() => setEditingImageId(null)} className="rounded-full border border-sand-300 px-4 py-1.5 text-sm">
                      Abbrechen
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
