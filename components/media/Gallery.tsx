"use client";

import { useEffect, useState } from "react";
import { pick, type Locale } from "@/lib/i18n";
import type { CompetitionImage } from "@/types/database";

export default function Gallery({ images, lang }: { images: CompetitionImage[]; lang: Locale }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpen(i)}
            className="aspect-square overflow-hidden rounded-xl bg-slate-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={pick(img, "caption", lang)} loading="lazy" className="h-full w-full object-cover transition hover:scale-105" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[open].url} alt="" className="max-h-[80vh] max-w-full rounded-lg object-contain" />
          <p className="mt-3 text-center text-white/80">{pick(images[open], "caption", lang)}</p>
        </div>
      )}
    </>
  );
}
