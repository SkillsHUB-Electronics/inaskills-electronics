"use client";

import Link from "next/link";
import Section from "@/components/ui/Section";
import CompetitionCard from "@/components/kompetisi/CompetitionCard";
import CardSkeleton from "@/components/ui/CardSkeleton";
import type { Dictionary, Locale } from "@/lib/i18n";
import { getLatestCompetitions } from "@/lib/queries";
import { useQuery } from "@/lib/useQuery";

export default function LatestCompetitions({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { data, loading } = useQuery(() => getLatestCompetitions(3), []);

  return (
    <Section title={dict.competitions.title}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {loading ? (
          <CardSkeleton count={3} className="h-64" />
        ) : (
          data.map((c) => <CompetitionCard key={c.id} c={c} lang={lang} dict={dict} />)
        )}
      </div>
      <Link href={`/${lang}/kompetisi/`} className="mt-6 inline-block font-semibold text-brand hover:underline">
        {dict.competitions.viewAll} →
      </Link>
    </Section>
  );
}
