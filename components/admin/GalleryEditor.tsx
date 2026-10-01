"use client";

import { useCallback, useEffect, useState } from "react";
import { list, remove, save, uploadImage, type Row } from "@/lib/mutations";

export default function GalleryEditor({ competitionId }: { competitionId: string }) {
  const [images, setImages] = useState<Row[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    list("competition_images", "urutan", true, ["competition_id", competitionId]).then(setImages).catch((e) => setError(e.message));
  }, [competitionId]);

  useEffect(load, [load]);

  // Bisa pilih banyak foto sekaligus; diunggah satu per satu.
  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setError("");
    for (const [i, file] of files.entries()) {
      setBusy(`Mengunggah ${i + 1}/${files.length}...`);
      try {
        const url = await uploadImage("competitions", file);
        await save("competition_images", { competition_id: competitionId, url, urutan: images.length + i });
      } catch (err) {
        setError(`${file.name}: ${(err as Error).message}`);
      }
    }
    setBusy("");
    e.target.value = "";
    load();
  }

  async function updateCaption(row: Row, field: "caption_id" | "caption_en", value: string) {
    if (row[field] === value) return;
    await save("competition_images", { id: row.id, [field]: value });
    load();
  }

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Galeri foto</h2>
        <label className="cursor-pointer rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-soft">
          {busy || "+ Upload foto"}
          <input type="file" accept="image/*" multiple onChange={onFiles} disabled={Boolean(busy)} className="hidden" />
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <div key={String(img.id)} className="overflow-hidden rounded-xl ring-1 ring-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={String(img.url)} alt="" className="aspect-video w-full object-cover" />
            <div className="space-y-2 p-3">
              <input
                defaultValue={String(img.caption_id ?? "")}
                placeholder="Keterangan (ID)"
                onBlur={(e) => updateCaption(img, "caption_id", e.target.value)}
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
              />
              <input
                defaultValue={String(img.caption_en ?? "")}
                placeholder="Caption (EN)"
                onBlur={(e) => updateCaption(img, "caption_en", e.target.value)}
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
              />
              <button type="button" onClick={() => remove("competition_images", String(img.id)).then(load)} className="text-sm font-semibold text-red-600 hover:underline">
                Hapus foto
              </button>
            </div>
          </div>
        ))}
      </div>
      {images.length === 0 && !busy && <p className="mt-2 text-sm text-slate-500">Belum ada foto.</p>}
    </section>
  );
}
