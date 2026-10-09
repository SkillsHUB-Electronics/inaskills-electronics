import Link from "next/link";
import AwardBadges from "@/components/hof/AwardBadges";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Alumni, Result } from "@/types/database";

// Kartu kompetitor; klik menuju profil alumni.
export default function CompetitorCards({ results, lang, dict }: { results: (Result & { alumni: Alumni })[]; lang: Locale; dict: Dictionary }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((r) => {
        const photo = r.foto_url || r.alumni.foto_url;
        return (
          <li key={r.id}>
            <Link href={`/${lang}/alumni/?slug=${r.alumni.slug}`} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 hover:bg-slate-50">
              <span className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-200">
                {photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={r.alumni.nama} loading="lazy" className="h-full w-full object-cover" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{r.alumni.nama}</span>
                <span className="block text-sm font-semibold text-brand">
                  {r.peringkat ? `#${r.peringkat} · ` : ""}
                  {dict.medals[r.medali]}
                </span>
                <AwardBadges awards={r} dict={dict} className="mt-1" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
