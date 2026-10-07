import Link from "next/link";
import MedalIcon from "@/components/hof/MedalIcon";
import { pick, type Dictionary, type Locale } from "@/lib/i18n";
import type { HallOfFameEntry } from "@/types/database";

const medalText: Record<string, string> = {
  gold: "text-amber-300",
  silver: "text-slate-200",
  bronze: "text-orange-300",
  moe: "text-sky-300",
};

// Kartu juara gaya "champion card": tahun & medali di kiri, foto di kanan, nama di bawah.
export default function ChampionCard({ entry, lang, dict }: { entry: HallOfFameEntry; lang: Locale; dict: Dictionary }) {
  const c = entry.competition;
  const photo = entry.foto_url || entry.alumni.foto_url;
  const note = pick({ catatan_id: entry.catatan, catatan_en: entry.catatan_en }, "catatan", lang);
  const medal = dict.hallOfFame.medalLong[entry.medali as keyof typeof dict.hallOfFame.medalLong] ?? dict.medals[entry.medali];

  return (
    <Link
      href={`/${lang}/alumni/?slug=${entry.alumni.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-ink text-white shadow-md ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:shadow-xl hover:ring-brand/60"
    >
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-ink-soft to-ink">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={entry.alumni.nama} className="absolute inset-y-0 right-0 h-full w-3/5 object-cover object-top transition duration-300 group-hover:scale-105" />
        )}
        {/* Gradasi agar teks kiri tetap terbaca di atas foto. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
        <div className="relative flex h-full max-w-[65%] flex-col p-4">
          <p className="text-3xl font-extrabold leading-none">{c.tahun}</p>
          <p className="mt-1 truncate text-xs text-white/70">{c.lokasi || pick(c, "nama", lang)}</p>
          <div className="mt-auto flex items-center gap-2">
            <MedalIcon medal={entry.medali} />
            <span className={`text-[11px] font-bold uppercase leading-tight tracking-wide ${medalText[entry.medali] ?? ""}`}>{medal}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-white/10 p-4">
        <p className="truncate font-bold">{entry.alumni.nama}</p>
        <p className="flex items-center gap-1.5 truncate text-xs text-white/60">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="2" />
            <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
          </svg>
          <span className="truncate">{note || `Electronics · ${c.level === "nasional" || c.level === "regional" ? dict.levels[c.level] : c.level.toUpperCase()}`}</span>
        </p>
        <span className="mt-2 self-end text-xs font-semibold text-white/80 group-hover:text-brand">{dict.hallOfFame.viewProfile} →</span>
      </div>
    </Link>
  );
}
