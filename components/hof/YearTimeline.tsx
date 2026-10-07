"use client";

import { useRef } from "react";
import type { Dictionary } from "@/lib/i18n";

// Timeline tahun kompetisi (terbaru di kiri). Klik tahun untuk memfilter; klik lagi untuk menampilkan semua.
export default function YearTimeline({
  years,
  value,
  onChange,
  dict,
}: {
  years: { tahun: number; lokasi: string }[];
  value: number | null;
  onChange: (v: number | null) => void;
  dict: Dictionary;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => scroller.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  if (years.length === 0) return null;

  return (
    <div className="rounded-2xl bg-ink px-4 py-4 text-white sm:px-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{dict.hallOfFame.competitionYear}</p>
        <div className="hidden gap-1 sm:flex">
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d < 0 ? dict.hallOfFame.prev : dict.hallOfFame.next}
              onClick={() => scroll(d)}
              className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-white/20 hover:bg-white/10"
            >
              {d < 0 ? "‹" : "›"}
            </button>
          ))}
        </div>
      </div>
      <div ref={scroller} className="mt-3 flex snap-x overflow-x-auto p-1 [scrollbar-width:none]">
        {years.map((y, i) => {
          const active = value === y.tahun;
          return (
            <button
              key={y.tahun}
              type="button"
              onClick={() => onChange(active ? null : y.tahun)}
              className="group flex w-52 shrink-0 snap-start items-center gap-3 text-left last:w-auto"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 transition ${
                  active ? "bg-brand ring-brand/40" : "ring-white/50 group-hover:ring-white"
                }`}
              >
                {active && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-bold ${active ? "text-white" : "text-white/85"}`}>{y.tahun}</span>
                <span className="block truncate text-xs text-white/55">{y.lokasi}</span>
              </span>
              {i < years.length - 1 && <span className="mr-3 h-px min-w-6 flex-1 bg-white/25" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
