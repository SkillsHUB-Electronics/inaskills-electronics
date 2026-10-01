"use client";

import { useState } from "react";
import Section from "@/components/ui/Section";
import CompetitionCard from "@/components/kompetisi/CompetitionCard";
import CardSkeleton from "@/components/ui/CardSkeleton";
import LevelFilter from "@/components/kompetisi/LevelFilter";
import type { Level } from "@/lib/levels";
import { getAllCompetitions } from "@/lib/queries";
import { useLocale } from "@/lib/useLocale";
import { useQuery } from "@/lib/useQuery";

export default function CompetitionsPage() {
  const { lang, dict } = useLocale();
  const { data, loading, error } = useQuery(getAllCompetitions, []);
  const [level, setLevel] = useState<Level | "all">("all");
  const list = data.filter((c) => level === "all" || c.level === level);

  return (
    <Section title={dict.competitionsPage.title} subtitle={dict.competitionsPage.subtitle}>
      <LevelFilter value={level} onChange={setLevel} dict={dict} />
      {error && <p className="mt-6 text-red-600">{dict.common.error}</p>}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <CardSkeleton count={6} className="h-64" />
        ) : (
          list.map((c) => <CompetitionCard key={c.id} c={c} lang={lang} dict={dict} />)
        )}
      </div>
      {!loading && list.length === 0 && <p className="text-slate-500">{dict.competitionsPage.empty}</p>}
    </Section>
  );
}
