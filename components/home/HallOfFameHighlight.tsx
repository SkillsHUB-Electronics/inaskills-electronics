"use client";

import Link from "next/link";
import Section from "@/components/ui/Section";
import AlumniCard from "@/components/alumni/AlumniCard";
import CardSkeleton from "@/components/ui/CardSkeleton";
import type { Dictionary, Locale } from "@/lib/i18n";
import { getHallOfFame } from "@/lib/queries";
import { useQuery } from "@/lib/useQuery";

export default function HallOfFameHighlight({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { data, loading } = useQuery(() => getHallOfFame(6), []);

  return (
    <Section title={dict.hallOfFame.title} subtitle={dict.hallOfFame.subtitle} className="bg-slate-50">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? <CardSkeleton count={3} /> : data.map((e) => <AlumniCard key={e.id} entry={e} lang={lang} dict={dict} />)}
      </div>
      <Link href={`/${lang}/hall-of-fame/`} className="mt-6 inline-block font-semibold text-brand hover:underline">
        {dict.hallOfFame.viewAll} →
      </Link>
    </Section>
  );
}
