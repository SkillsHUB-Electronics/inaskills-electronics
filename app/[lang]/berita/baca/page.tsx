"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Section from "@/components/ui/Section";
import { formatDate } from "@/components/berita/NewsCard";
import { pick } from "@/lib/i18n";
import { getNewsBySlug } from "@/lib/queries";
import { useLocale } from "@/lib/useLocale";
import { useQuery } from "@/lib/useQuery";

function Article({ slug }: { slug: string }) {
  const { lang, dict } = useLocale();
  const { data: n, loading, error } = useQuery(() => getNewsBySlug(slug), null);

  if (loading) return <Section><p className="text-slate-500">{dict.common.loading}</p></Section>;
  if (error) return <Section><p className="text-red-600">{dict.common.error}</p></Section>;
  if (!n) return <Section><p className="text-slate-500">{dict.common.notFound}</p></Section>;

  return (
    <article className="px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link href={`/${lang}/berita/`} className="text-sm font-semibold text-brand hover:underline">
          ← {dict.newsSection.title}
        </Link>
        <time className="mt-6 block text-sm font-semibold uppercase tracking-wide text-slate-500">{formatDate(n.tanggal, lang)}</time>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">{pick(n, "judul", lang)}</h1>
        <p className="mt-4 text-lg text-slate-600">{pick(n, "ringkasan", lang)}</p>
        {n.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={n.cover_url} alt="" className="mt-8 w-full rounded-2xl object-cover" />
        )}
        <div className="mt-8 whitespace-pre-line leading-relaxed text-slate-800">{pick(n, "isi", lang)}</div>
      </div>
    </article>
  );
}

function WithSlug() {
  const slug = useSearchParams().get("slug") ?? "";
  return <Article key={slug} slug={slug} />;
}

export default function NewsArticlePage() {
  return (
    <Suspense>
      <WithSlug />
    </Suspense>
  );
}
