import Link from "next/link";
import LevelBadge from "@/components/ui/LevelBadge";
import { pick, type Dictionary, type Locale } from "@/lib/i18n";
import type { HallOfFameEntry } from "@/types/database";

const medalStyle: Record<string, string> = {
  gold: "bg-amber-400",
  silver: "bg-slate-300",
  bronze: "bg-orange-400",
  moe: "bg-sky-400",
};

export default function AlumniCard({
  entry,
  lang,
  dict,
}: {
  entry: HallOfFameEntry;
  lang: Locale;
  dict: Dictionary;
}) {
  return (
    <Link
      href={`/${lang}/alumni/?slug=${entry.alumni.slug}`}
      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-200">
        {entry.alumni.foto_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.alumni.foto_url} alt={entry.alumni.nama} className="h-full w-full object-cover" />
        )}
        <span
          className={`absolute bottom-0 right-0 h-4 w-4 rounded-full ring-2 ring-white ${medalStyle[entry.medali] ?? ""}`}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold">{entry.alumni.nama}</p>
        <p className="truncate text-sm text-slate-600">
          {dict.medals[entry.medali]} · {pick(entry.competition, "nama", lang)}
        </p>
        <div className="mt-1">
          <LevelBadge level={entry.competition.level} label={dict.levels[entry.competition.level]} />
        </div>
      </div>
    </Link>
  );
}
