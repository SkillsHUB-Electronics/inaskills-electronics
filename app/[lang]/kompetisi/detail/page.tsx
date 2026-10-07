"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Section from "@/components/ui/Section";
import LevelBadge from "@/components/ui/LevelBadge";
import ResultTable from "@/components/kompetisi/ResultTable";
import Gallery from "@/components/media/Gallery";
import { dateRange, place } from "@/lib/competition";
import { pick } from "@/lib/i18n";
import { getCompetitionBySlug } from "@/lib/queries";
import { useLocale } from "@/lib/useLocale";
import { useQuery } from "@/lib/useQuery";

function Detail({ slug }: { slug: string }) {
  const { lang, dict } = useLocale();
  const { data, loading, error } = useQuery(() => getCompetitionBySlug(slug), null);

  if (loading) return <Section><p className="text-slate-500">{dict.common.loading}</p></Section>;
  if (error) return <Section><p className="text-red-600">{dict.common.error}</p></Section>;
  if (!data) return <Section><p className="text-slate-500">{dict.common.notFound}</p></Section>;

  const { competition: c, results, images } = data;
  return (
    <>
      <header className="relative bg-ink px-4 py-14 text-white sm:py-20">
        {c.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        )}
        <div className="relative mx-auto max-w-6xl">
          <LevelBadge level={c.level} label={dict.levels[c.level]} />
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{pick(c, "nama", lang)}</h1>
          <p className="mt-2 text-white/80">{[place(c), dateRange(c, lang) || c.tahun].filter(Boolean).join(" · ")}</p>
          {c.website_url && (
            <a
              href={c.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              {dict.competitionDetail.website} ↗
            </a>
          )}
        </div>
      </header>
      <Section title={dict.competitionDetail.overview}>
        <p className="max-w-3xl whitespace-pre-line text-slate-700">{pick(c, "overview", lang)}</p>
      </Section>
      {results.length > 0 && (
        <Section title={dict.competitionDetail.results} className="bg-slate-50">
          <ResultTable results={results} lang={lang} dict={dict} />
        </Section>
      )}
      {images.length > 0 && (
        <Section title={dict.competitionDetail.gallery}>
          <Gallery images={images} lang={lang} />
        </Section>
      )}
    </>
  );
}

function WithSlug() {
  const slug = useSearchParams().get("slug") ?? "";
  // key memaksa data dimuat ulang saat slug berubah.
  return <Detail key={slug} slug={slug} />;
}

export default function CompetitionDetailPage() {
  return (
    <Suspense>
      <WithSlug />
    </Suspense>
  );
}
