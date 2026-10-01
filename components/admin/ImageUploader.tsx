"use client";

import { useState } from "react";
import { uploadImage } from "@/lib/mutations";

export default function ImageUploader({
  bucket,
  value,
  onChange,
  kind = "image",
}: {
  bucket: string;
  value: string;
  onChange: (url: string) => void;
  kind?: "image" | "file";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadImage(bucket, file));
    } catch (err) {
      setError(`Upload gagal: ${(err as Error).message}`);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center">
      {kind === "image" ? (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs text-slate-400">Belum ada</span>
          )}
        </div>
      ) : (
        <span className="min-w-0 truncate text-sm font-normal text-slate-500">
          {value ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
              {decodeURIComponent(value.split("/").pop() ?? "")}
            </a>
          ) : (
            "Belum ada file"
          )}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-soft">
          {busy ? "Mengunggah..." : kind === "image" ? "Pilih gambar" : "Pilih file"}
          <input type="file" accept={kind === "image" ? "image/*" : ".pdf,.zip,.rar,.7z,.doc,.docx,.xls,.xlsx,.png,.jpg"} onChange={onFile} disabled={busy} className="hidden" />
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-sm font-semibold text-red-600 hover:underline">
            {kind === "image" ? "Hapus gambar" : "Hapus file"}
          </button>
        )}
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
