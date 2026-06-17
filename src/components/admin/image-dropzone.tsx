"use client";

import { useRef, useState } from "react";

/**
 * Verkleinert ein Bild bereits im Browser (max. Kantenlänge, JPEG), damit der
 * Upload klein bleibt und das Server-Größenlimit nicht überschritten wird.
 * Schlägt das Dekodieren fehl (z. B. HEIC), wird die Originaldatei zurückgegeben.
 */
function downscaleImage(file: File, maxDim = 1600, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      if (scale === 1 && file.size < 2_000_000) return resolve(file); // schon klein genug
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(file);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          resolve(new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Bild konnte nicht gelesen werden."));
    };
    img.src = url;
  });
}

/**
 * Bild-Upload per Drag & Drop (oder Klick). Die ausgewählte Datei wird in ein
 * echtes <input type="file" name=…> gelegt, sodass sie ganz normal mit dem
 * umgebenden Formular (Server-Action) gesendet wird.
 */
export function ImageDropzone({
  name = "image",
  existingSrc,
  label = "Bild hierher ziehen oder klicken zum Auswählen",
}: {
  name?: string;
  existingSrc?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function setFile(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    let toUse = file;
    try {
      toUse = await downscaleImage(file);
    } catch {
      toUse = file; // Fallback: Originaldatei (z. B. wenn HEIC nicht dekodierbar)
    }
    const dt = new DataTransfer();
    dt.items.add(toUse);
    if (inputRef.current) inputRef.current.files = dt.files;
    setPreview(URL.createObjectURL(toUse));
  }

  const shown = preview ?? existingSrc ?? null;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        setFile(e.dataTransfer.files?.[0] ?? null);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-3 text-sm transition ${
        dragOver ? "border-brand-500 bg-brand-50" : "border-sand-300 bg-white hover:bg-sand-50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      {shown ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shown} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-sand-200" />
      ) : (
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-sand-100 text-ink-soft">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5h16v14H4zM4 15l4-4 4 4M14 13l2-2 4 4" />
            <circle cx="9" cy="9" r="1.4" />
          </svg>
        </span>
      )}
      <span className="text-ink-soft">
        {preview ? "Bild ausgewählt – zum Ändern klicken" : label}
      </span>
    </div>
  );
}
