"use client";

import Link from "next/link";
import LevelBadge from "@/components/ui/LevelBadge";
import { pick } from "@/lib/i18n";
import { levelShort } from "@/lib/levels";
import { useLocale } from "@/lib/useLocale";
import type { ExpertDetail } from "@/types/database";

export default function ExpertProfile({ expert: e }: { expert: ExpertDetail }) {
  const { lang, dict } = useLocale();
  const t = dict.expertPage;
  const a = e.alumni;
  const photo = e.foto_url || a?.foto_url;
  const job = e.pekerjaan || a?.pekerjaan;
  const org = e.instansi || a?.instansi;
  const bio = pick(e, "bio", lang) || (a ? pick(a, "bio", lang) : "");
  const comps = [...e.competition_experts].sort((x, y) => y.competition.tahun - x.competition.tahun);
  const box = "rounded-2xl bg-white p-5 ring-1 ring-slate-200";

  return (
    <div className="bg-slate-50">
      <header className="bg-gradient-to-br from-sky-50 via-white to-red-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 text-center sm:flex-row sm:items-start sm:text-left lg:py-14">
          <div className="h-36 w-36 shrink-0 overflow-hidden rounded-full bg-slate-200 shadow-lg ring-4 ring-white sm:h-44 sm:w-44">
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={e.nama} className="h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold text-ink">{e.nama}</h1>
            <span className="mt-2 inline-block rounded-md bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">{t.badge}</span>
            {(job || org) && <p className="mt-2 font-semibold text-brand">{[job, org].filter(Boolean).join(" - ")}</p>}
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              {a && (
                <Link href={`/${lang}/alumni/?slug=${a.slug}`} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-soft">
                  {t.alumniProfile} →
                </Link>
              )}
              {e.linkedin_url && (
                <a href={e.linkedin_url} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-slate-300 hover:bg-white">
                  LinkedIn ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-8 lg:grid-cols-[1fr_24rem]">
        <section className={box}>
          <h2 className="font-bold">{t.about}</h2>
          {bio ? <p className="mt-3 whitespace-pre-line text-slate-700">{bio}</p> : <p className="mt-3 text-sm text-slate-500">{t.noData}</p>}
        </section>
        <section className={box}>
          <h2 className="font-bold">{t.competitions}</h2>
          {comps.length ? (
            <div className="mt-3 space-y-2">
              {comps.map((c) => (
                <Link key={c.id} href={`/${lang}/kompetisi/detail/?slug=${c.competition.slug}`} className="flex items-center gap-3 rounded-xl p-3 ring-1 ring-slate-100 hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{pick(c.competition, "nama", lang)}</p>
                    <LevelBadge level={c.competition.level} label={levelShort[c.competition.level]} />
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-brand">{pick(c, "peran", lang) || dict.competitionDetail.expertDefault}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">{t.noData}</p>
          )}
        </section>
      </div>
    </div>
  );
}
