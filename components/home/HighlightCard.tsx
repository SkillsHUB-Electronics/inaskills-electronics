"use client";

import Link from "next/link";
import LevelBadge from "@/components/ui/LevelBadge";
import { dateRange, place } from "@/lib/competition";
import { pick, type Dictionary, type Locale } from "@/lib/i18n";
import { getHighlight } from "@/lib/queries";
import { useQuery } from "@/lib/useQuery";

const medalDots = [
  { key: "gold", color: "bg-amber-400" },
  { key: "silver", color: "bg-slate-300" },
  { key: "bronze", color: "bg-orange-400" },
  { key: "moe", color: "bg-sky-400" },
] as const;

// Kartu sorotan kompetisi terbaru (terinspirasi blok hasil kompetisi di worldskills.org).
export default function HighlightCard({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { data } = useQuery(getHighlight, null);
  if (!data) return null;
  const { competition: c, medals } = data;

  return (
    <section className="relative z-10 -mt-12 px-4 sm:-mt-16">
      <Link
        href={`/${lang}/kompetisi/detail/?slug=${c.slug}`}
        className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 transition hover:shadow-2xl md:flex-row"
      >
        <div className="relative aspect-video bg-gradient-to-br from-brand to-brand-dark md:aspect-auto md:w-2/5">
          {c.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.cover_url} alt="" className="h-full w-full object-cover" />
          )}
          {c.logo_url && (
            <span className="absolute bottom-4 left-4 flex h-16 w-16 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.logo_url} alt={`Logo ${pick(c, "nama", lang)}`} className="max-h-full max-w-full object-contain" />
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center gap-3 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand">{dict.highlight.label}</span>
            <LevelBadge level={c.level} label={dict.levels[c.level]} />
          </div>
          <h2 className="text-xl font-extrabold sm:text-2xl">{pick(c, "nama", lang)}</h2>
          <p className="text-sm text-slate-500">{[place(c), dateRange(c, lang) || c.tahun].filter(Boolean).join(" · ")}</p>
          <div className="flex flex-wrap items-center gap-4">
            {medalDots
              .filter((m) => medals[m.key] > 0)
              .map((m) => (
                <span key={m.key} className="flex items-center gap-1.5 text-sm font-semibold">
                  <span className={`h-3 w-3 rounded-full ${m.color}`} />
                  {medals[m.key]} {dict.medals[m.key]}
                </span>
              ))}
          </div>
          <span className="font-semibold text-brand">{dict.highlight.results} →</span>
        </div>
      </Link>
    </section>
  );
}
