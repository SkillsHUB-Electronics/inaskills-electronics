"use client";

import type { Dictionary } from "@/lib/i18n";
import { getStats, type Stats } from "@/lib/queries";
import { useQuery } from "@/lib/useQuery";

const keys = ["medals", "competitions", "alumni", "countries"] as const;

export default function StatsCounter({ dict }: { dict: Dictionary }) {
  // Dihitung otomatis dari data Hall of Fame & Kompetisi.
  const { data, loading } = useQuery<Stats | null>(getStats, null);
  const value = (k: (typeof keys)[number]) => (loading || !data ? "–" : data[k]);

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-10">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 text-center md:grid-cols-4">
        {keys.map((k) => (
          <div key={k}>
            <dt className="text-sm text-slate-500">{dict.stats[k]}</dt>
            <dd className="mt-1 text-3xl font-extrabold text-brand sm:text-4xl">{value(k)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
