import Link from "next/link";
import { pick, type Dictionary, type Locale } from "@/lib/i18n";
import type { CompetitionExpert } from "@/types/database";

// Data tampilan dari daftar expert; yang kosong dilengkapi data alumni bila expert juga alumni (menaut ke profilnya).
export default function ExpertList({ experts, lang, dict }: { experts: CompetitionExpert[]; lang: Locale; dict: Dictionary }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {experts.map((ce) => {
        const e = ce.expert;
        if (!e) return null;
        const a = e.alumni;
        const photo = e.foto_url || a?.foto_url;
        const org = e.instansi || a?.instansi;
        const role = pick(ce, "peran", lang) || dict.competitionDetail.expertDefault;
        const body = (
          <>
            <span className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-200">
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={e.nama} loading="lazy" className="h-full w-full object-cover" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold">{e.nama}</span>
              <span className="block text-sm font-semibold text-brand">{role}</span>
              {org && <span className="block truncate text-sm text-slate-500">{org}</span>}
            </span>
          </>
        );
        const cls = "flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200";
        return (
          <li key={ce.id}>
            {a ? (
              <Link href={`/${lang}/alumni/?slug=${a.slug}`} className={`${cls} hover:bg-slate-50`}>
                {body}
              </Link>
            ) : (
              <div className={cls}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
