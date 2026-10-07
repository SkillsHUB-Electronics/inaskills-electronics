import Link from "next/link";
import LevelBadge from "@/components/ui/LevelBadge";
import { dateRange, place } from "@/lib/competition";
import { pick, type Dictionary, type Locale } from "@/lib/i18n";
import type { Competition } from "@/types/database";

export default function CompetitionCard({ c, lang, dict }: { c: Competition; lang: Locale; dict: Dictionary }) {
  return (
    <Link
      href={`/${lang}/kompetisi/detail/?slug=${c.slug}`}
      className="group overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-ink to-ink-soft">
        {c.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.cover_url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
        )}
        {c.logo_url && (
          <span className="absolute bottom-3 left-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.logo_url} alt={`Logo ${pick(c, "nama", lang)}`} className="max-h-full max-w-full object-contain" />
          </span>
        )}
      </div>
      <div className="p-5">
        <LevelBadge level={c.level} label={dict.levels[c.level]} />
        <h3 className="mt-2 font-semibold">{pick(c, "nama", lang)}</h3>
        <p className="text-sm text-slate-500">
          {[place(c), dateRange(c, lang) || c.tahun].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
