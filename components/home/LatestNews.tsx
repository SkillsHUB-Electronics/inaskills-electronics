"use client";

import Link from "next/link";
import Section from "@/components/ui/Section";
import CardSkeleton from "@/components/ui/CardSkeleton";
import NewsCard from "@/components/berita/NewsCard";
import type { Dictionary, Locale } from "@/lib/i18n";
import { getNews } from "@/lib/queries";
import { useQuery } from "@/lib/useQuery";

export default function LatestNews({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { data, loading } = useQuery(() => getNews(3), []);
  if (!loading && data.length === 0) return null;

  return (
    <Section title={dict.newsSection.title} className="bg-slate-50">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {loading ? <CardSkeleton count={3} className="h-72" /> : data.map((n) => <NewsCard key={n.id} n={n} lang={lang} dict={dict} />)}
      </div>
      <Link href={`/${lang}/berita/`} className="mt-6 inline-block font-semibold text-brand hover:underline">
        {dict.newsSection.viewAll} →
      </Link>
    </Section>
  );
}
