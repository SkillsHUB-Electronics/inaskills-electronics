"use client";

import Section from "@/components/ui/Section";
import type { Dictionary } from "@/lib/i18n";
import { getSponsors } from "@/lib/queries";
import { useQuery } from "@/lib/useQuery";

export default function SponsorStrip({ dict }: { dict: Dictionary }) {
  const { data, loading } = useQuery(getSponsors, []);

  return (
    <Section title={dict.sponsors.title} className="bg-slate-50">
      {!loading && data.length === 0 ? (
        <p className="text-slate-500">{dict.sponsors.empty}</p>
      ) : (
        <div className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {data.map((s) => (
            <a
              key={s.id}
              href={s.website ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-20 items-center justify-center rounded-xl bg-white p-4 ring-1 ring-slate-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.logo_url} alt={s.nama} className="max-h-full max-w-full object-contain grayscale transition hover:grayscale-0" />
            </a>
          ))}
        </div>
      )}
    </Section>
  );
}
