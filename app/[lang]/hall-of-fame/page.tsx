"use client";

import { useState } from "react";
import Section from "@/components/ui/Section";
import CardSkeleton from "@/components/ui/CardSkeleton";
import LevelBadge from "@/components/ui/LevelBadge";
import LevelFilter from "@/components/kompetisi/LevelFilter";
import ChampionCard from "@/components/hof/ChampionCard";
import HofHeading from "@/components/hof/HofHeading";
import YearTimeline from "@/components/hof/YearTimeline";
import { hofMedals, levelShort, internationalLevels, levelsByRank, type Level } from "@/lib/levels";
import { getHallOfFame } from "@/lib/queries";
import { useLocale } from "@/lib/useLocale";
import { useQuery } from "@/lib/useQuery";

const medalDot: Record<string, string> = {
  gold: "bg-amber-400",
  silver: "bg-slate-300",
  bronze: "bg-orange-400",
  moe: "bg-sky-400",
};

export default function HallOfFamePage() {
  const { lang, dict } = useLocale();
  const { data, loading, error } = useQuery(() => getHallOfFame(), []);
  const [level, setLevel] = useState<Level | "all">("all");
  const [year, setYear] = useState<number | null>(null);

  // Tahun unik untuk timeline, terbaru dulu, beserta lokasinya (digabung bila lebih dari satu).
  const yearMap = new Map<number, Set<string>>();
  for (const e of data) {
    const set = yearMap.get(e.competition.tahun) ?? new Set<string>();
    if (e.competition.lokasi) set.add(e.competition.lokasi);
    yearMap.set(e.competition.tahun, set);
  }
  const years = [...yearMap.entries()].sort((a, b) => b[0] - a[0]).map(([tahun, lokasi]) => ({ tahun, lokasi: [...lokasi].join(" · ") }));

  // Dikelompokkan per tingkat lomba: WSI, WSA, ASC selalu tampil; Nasional & Regional bila ada juara.
  // Di dalam grup: medali tertinggi dulu, lalu tahun terbaru.
  const groups = levelsByRank
    .filter((l) => level === "all" || l === level)
    .map((l) => ({
      level: l,
      entries: data
        .filter((e) => e.competition.level === l && (year === null || e.competition.tahun === year))
        .sort((a, b) => b.competition.tahun - a.competition.tahun || hofMedals.indexOf(a.medali as never) - hofMedals.indexOf(b.medali as never)),
    }))
    .filter((g) => g.entries.length > 0 || (year === null && (internationalLevels.includes(g.level) || level === g.level)));

  return (
    <Section>
      <HofHeading dict={dict} as="h1" />
      <div className="mt-8 space-y-4">
        <YearTimeline years={years} value={year} onChange={setYear} dict={dict} />
        <LevelFilter value={level} onChange={setLevel} dict={dict} />
      </div>
      {error && <p className="mt-6 text-red-600">{dict.common.error}</p>}
      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton count={4} className="h-72" />
        </div>
      ) : groups.length === 0 ? (
        <p className="mt-8 text-slate-500">{dict.hallOfFamePage.empty}</p>
      ) : (
        groups.map((g) => (
          <section key={g.level} className="mt-10">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{dict.hallOfFamePage.scope[g.level]}</p>
                <h2 className="text-xl font-bold">{dict.levels[g.level]}</h2>
              </div>
              {g.entries.length > 0 && (
                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  {hofMedals.map((m) => {
                    const n = g.entries.filter((e) => e.medali === m).length;
                    return n ? (
                      <span key={m} className="flex items-center gap-1.5">
                        <span className={`h-3 w-3 rounded-full ${medalDot[m]}`} />
                        {n} {dict.medals[m]}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            {g.entries.length === 0 ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <LevelBadge level={g.level} label={levelShort[g.level]} />
                {dict.hallOfFamePage.noneYet}
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {g.entries.map((e) => (
                  <ChampionCard key={e.id} entry={e} lang={lang} dict={dict} />
                ))}
              </div>
            )}
          </section>
        ))
      )}
    </Section>
  );
}
