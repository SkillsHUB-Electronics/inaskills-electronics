"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ExpertCard from "@/components/hof/ExpertCard";
import ExpertProfile from "@/components/expert/ExpertProfile";
import CardSkeleton from "@/components/ui/CardSkeleton";
import Section from "@/components/ui/Section";
import { getExpertBySlug, getExperts } from "@/lib/queries";
import { useLocale } from "@/lib/useLocale";
import { useQuery } from "@/lib/useQuery";

function Profile({ slug }: { slug: string }) {
  const { dict } = useLocale();
  const { data, loading, error } = useQuery(() => getExpertBySlug(slug), null);

  if (loading) return <Section><p className="text-slate-500">{dict.common.loading}</p></Section>;
  if (error) return <Section><p className="text-red-600">{dict.common.error}</p></Section>;
  if (!data) return <Section><p className="text-slate-500">{dict.common.notFound}</p></Section>;
  return <ExpertProfile expert={data} />;
}

function List() {
  const { lang, dict } = useLocale();
  const { data, loading, error } = useQuery(() => getExperts(), []);
  const t = dict.expertPage;

  return (
    <Section title={t.title} subtitle={t.subtitle}>
      {error && <p className="text-red-600">{dict.common.error}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? <CardSkeleton count={4} className="h-72" /> : data.map((e) => <ExpertCard key={e.id} expert={e} lang={lang} dict={dict} />)}
      </div>
      {!loading && data.length === 0 && <p className="text-slate-500">{t.empty}</p>}
    </Section>
  );
}

function WithSlug() {
  const slug = useSearchParams().get("slug") ?? "";
  return slug ? <Profile key={slug} slug={slug} /> : <List />;
}

export default function ExpertPage() {
  return (
    <Suspense>
      <WithSlug />
    </Suspense>
  );
}
