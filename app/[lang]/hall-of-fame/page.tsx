"use client";

import { useState } from "react";
import Section from "@/components/ui/Section";
import AlumniCard from "@/components/alumni/AlumniCard";
import CardSkeleton from "@/components/ui/CardSkeleton";
import LevelBadge from "@/components/ui/LevelBadge";
import LevelFilter from "@/components/kompetisi/LevelFilter";
import { hofMedals, internationalLevels, levelsByRank, type Level } from "@/lib/levels";
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

  // Dikelompokkan per tingkat lomba: WSC, WSA, ASC selalu tampil; Nasional & Regional bila ada juara.
  // Di dalam grup: medali tertinggi dulu, lalu tahun terbaru.
  const groups = levelsByRank
    .filter((l) => level === "all" || l === level)
    .map((l) => ({
      level: l,
      entries: data
        .filter((e) => e.competition.level === l)
        .sort((a, b) => hofMedals.indexOf(a.medali as never) - hofMedals.indexOf(b.medali as never) || b.competition.tahun - a.competition.tahun),
    }))
    .filter((g) => g.entries.length > 0 || internationalLevels.includes(g.level) || level === g.level);

  return (
    <Section title={dict.hallOfFame.title} subtitle={dict.hallOfFame.subtitle}>
      <LevelFilter value={level} onChange={setLevel} dict={dict} />
      {error && <p className="mt-6 text-red-600">{dict.common.error}</p>}
      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton count={6} />
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.level} className="mt-10 first-of-type:mt-8">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{dict.hallOfFamePage.scope[g.level]}</p>
                <h3 className="text-xl font-bold">{dict.levels[g.level]}</h3>
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
                <LevelBadge level={g.level} label={g.level.toUpperCase()} />
                {dict.hallOfFamePage.noneYet}
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.entries.map((e) => (
                  <AlumniCard key={e.id} entry={e} lang={lang} dict={dict} />
                ))}
              </div>
            )}
          </section>
        ))
      )}
    </Section>
  );
}
