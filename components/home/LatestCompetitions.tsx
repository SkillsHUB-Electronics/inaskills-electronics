"use client";

import Link from "next/link";
import Section from "@/components/ui/Section";
import LevelBadge from "@/components/ui/LevelBadge";
import { pick, type Dictionary, type Locale } from "@/lib/i18n";
import { getLatestCompetitions } from "@/lib/queries";
import { useQuery } from "@/lib/useQuery";

export default function LatestCompetitions({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { data } = useQuery(() => getLatestCompetitions(3), []);

  return (
    <Section title={dict.competitions.title}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {data.map((c) => (
          <Link
            key={c.id}
            href={`/${lang}/kompetisi/detail/?slug=${c.slug}`}
            className="group overflow-hidden rounded-2xl ring-1 ring-slate-200 transition hover:shadow-lg"
          >
            <div className="aspect-video bg-gradient-to-br from-ink to-ink-soft">
              {c.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.cover_url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
              )}
            </div>
            <div className="p-5">
              <LevelBadge level={c.level} label={dict.levels[c.level]} />
              <h3 className="mt-2 font-semibold">{pick(c, "nama", lang)}</h3>
              <p className="text-sm text-slate-500">
                {c.lokasi} · {c.tahun}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <Link href={`/${lang}/kompetisi/`} className="mt-6 inline-block font-semibold text-brand hover:underline">
        {dict.competitions.viewAll} →
      </Link>
    </Section>
  );
}
