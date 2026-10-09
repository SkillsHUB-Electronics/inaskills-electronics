"use client";

import Link from "next/link";
import Section from "@/components/ui/Section";
import CardSkeleton from "@/components/ui/CardSkeleton";
import ExpertCard from "@/components/hof/ExpertCard";
import type { Dictionary, Locale } from "@/lib/i18n";
import { getExperts } from "@/lib/queries";
import { useQuery } from "@/lib/useQuery";

// Seksi Expert di bawah Hall of Fame; disembunyikan bila belum ada expert.
export default function ExpertHighlight({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { data, loading } = useQuery(() => getExperts(5), []);
  if (!loading && data.length === 0) return null;
  const t = dict.expertPage;

  return (
    <Section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-brand">
            <span className="h-0.5 w-8 bg-brand" />
            {t.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">{t.title}</h2>
          <p className="mt-2 max-w-xl text-slate-600">{t.subtitle}</p>
        </div>
        <Link href={`/${lang}/expert/`} className="shrink-0 self-start border-b-2 border-brand pb-1 text-sm font-semibold hover:text-brand sm:self-auto">
          {t.viewAll} →
        </Link>
      </div>
      <div className="-mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
        {loading ? (
          <CardSkeleton count={3} className="h-72 w-64 shrink-0 lg:w-auto" />
        ) : (
          data.map((e) => (
            <div key={e.id} className="w-64 shrink-0 snap-start lg:w-auto">
              <ExpertCard expert={e} lang={lang} dict={dict} />
            </div>
          ))
        )}
      </div>
    </Section>
  );
}
