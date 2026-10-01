"use client";

import Section from "@/components/ui/Section";
import CardSkeleton from "@/components/ui/CardSkeleton";
import NewsCard from "@/components/berita/NewsCard";
import { getNews } from "@/lib/queries";
import { useLocale } from "@/lib/useLocale";
import { useQuery } from "@/lib/useQuery";

export default function NewsPage() {
  const { lang, dict } = useLocale();
  const { data, loading, error } = useQuery(() => getNews(), []);

  return (
    <Section title={dict.newsSection.title}>
      {error && <p className="text-red-600">{dict.common.error}</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? <CardSkeleton count={6} className="h-72" /> : data.map((n) => <NewsCard key={n.id} n={n} lang={lang} dict={dict} />)}
      </div>
      {!loading && data.length === 0 && <p className="text-slate-500">{dict.newsSection.empty}</p>}
    </Section>
  );
}
