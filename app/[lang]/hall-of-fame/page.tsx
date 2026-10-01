"use client";

import { useState } from "react";
import Section from "@/components/ui/Section";
import AlumniCard from "@/components/alumni/AlumniCard";
import CardSkeleton from "@/components/ui/CardSkeleton";
import LevelFilter from "@/components/kompetisi/LevelFilter";
import { levels, type Level } from "@/lib/levels";
import { getHallOfFame } from "@/lib/queries";
import { useLocale } from "@/lib/useLocale";
import { useQuery } from "@/lib/useQuery";

export default function HallOfFamePage() {
  const { lang, dict } = useLocale();
  const { data, loading, error } = useQuery(() => getHallOfFame(), []);
  const [level, setLevel] = useState<Level | "all">("all");

  // Tampilkan per level, dari tertinggi (WSC) ke terendah.
  const groups = [...levels]
    .reverse()
    .filter((l) => level === "all" || l === level)
    .map((l) => ({ level: l, entries: data.filter((e) => e.competition.level === l) }))
    .filter((g) => g.entries.length > 0);

  return (
    <Section title={dict.hallOfFame.title} subtitle={dict.hallOfFame.subtitle}>
      <LevelFilter value={level} onChange={setLevel} dict={dict} />
      {error && <p className="mt-6 text-red-600">{dict.common.error}</p>}
      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton count={6} />
        </div>
      ) : groups.length === 0 ? (
        <p className="mt-8 text-slate-500">{dict.hallOfFamePage.empty}</p>
      ) : (
        groups.map((g) => (
          <div key={g.level} className="mt-10">
            <h3 className="text-lg font-bold">{dict.levels[g.level]}</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.entries.map((e) => (
                <AlumniCard key={e.id} entry={e} lang={lang} dict={dict} />
              ))}
            </div>
          </div>
        ))
      )}
    </Section>
  );
}
