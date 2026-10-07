"use client";

import Link from "next/link";
import Section from "@/components/ui/Section";
import CardSkeleton from "@/components/ui/CardSkeleton";
import ChampionCard from "@/components/hof/ChampionCard";
import HofHeading from "@/components/hof/HofHeading";
import type { Dictionary, Locale } from "@/lib/i18n";
import { getHallOfFame } from "@/lib/queries";
import { useQuery } from "@/lib/useQuery";

export default function HallOfFameHighlight({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { data, loading } = useQuery(() => getHallOfFame(5), []);

  return (
    <Section className="bg-slate-50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <HofHeading dict={dict} />
        <Link href={`/${lang}/hall-of-fame/`} className="shrink-0 self-start border-b-2 border-brand pb-1 sm:self-auto text-sm font-semibold hover:text-brand">
          {dict.hallOfFame.viewAllChampions} →
        </Link>
      </div>
      {/* HP: geser horizontal; desktop: 5 kolom. */}
      <div className="-mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
        {loading ? (
          <CardSkeleton count={3} className="h-72 w-64 shrink-0 lg:w-auto" />
        ) : (
          data.map((e) => (
            <div key={e.id} className="w-64 shrink-0 snap-start lg:w-auto">
              <ChampionCard entry={e} lang={lang} dict={dict} />
            </div>
          ))
        )}
      </div>
      {!loading && data.length === 0 && <p className="text-slate-500">{dict.hallOfFame.empty}</p>}
    </Section>
  );
}
