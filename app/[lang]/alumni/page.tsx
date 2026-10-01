"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Section from "@/components/ui/Section";
import LevelBadge from "@/components/ui/LevelBadge";
import { pick } from "@/lib/i18n";
import { getAlumniBySlug } from "@/lib/queries";
import { useLocale } from "@/lib/useLocale";
import { useQuery } from "@/lib/useQuery";

function Profile({ slug }: { slug: string }) {
  const { lang, dict } = useLocale();
  const { data, loading, error } = useQuery(() => getAlumniBySlug(slug), null);

  if (loading) return <Section><p className="text-slate-500">{dict.common.loading}</p></Section>;
  if (error) return <Section><p className="text-red-600">{dict.common.error}</p></Section>;
  if (!data) return <Section><p className="text-slate-500">{dict.common.notFound}</p></Section>;

  const { alumni: a, results } = data;
  const sorted = [...results].sort((x, y) => y.competition.tahun - x.competition.tahun);

  return (
    <Section>
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
        <div className="h-40 w-40 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-4 ring-brand/20 sm:h-48 sm:w-48">
          {a.foto_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.foto_url} alt={a.nama} className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">{a.nama}</h1>
          <p className="mt-1 text-slate-500">
            {[a.asal_daerah && `${dict.alumniPage.origin}: ${a.asal_daerah}`, a.tahun_aktif && `${dict.alumniPage.active}: ${a.tahun_aktif}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="mt-4 max-w-2xl whitespace-pre-line text-slate-700">{pick(a, "bio", lang)}</p>
        </div>
      </div>

      <h2 className="mt-12 text-xl font-bold">{dict.alumniPage.achievements}</h2>
      <ul className="mt-4 divide-y divide-slate-200 rounded-2xl ring-1 ring-slate-200">
        {sorted.map((r) => (
          <li key={r.id}>
            <Link
              href={`/${lang}/kompetisi/detail/?slug=${r.competition.slug}`}
              className="flex flex-col gap-1 p-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{pick(r.competition, "nama", lang)}</p>
                <div className="mt-1">
                  <LevelBadge level={r.competition.level} label={dict.levels[r.competition.level]} />
                </div>
              </div>
              <span className="font-semibold text-brand">{dict.medals[r.medali]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function WithSlug() {
  const slug = useSearchParams().get("slug") ?? "";
  return <Profile key={slug} slug={slug} />;
}

export default function AlumniPage() {
  return (
    <Suspense>
      <WithSlug />
    </Suspense>
  );
}
