"use client";

import type { Dictionary } from "@/lib/i18n";
import { getSiteContent } from "@/lib/queries";
import { useQuery } from "@/lib/useQuery";

const keys = ["medals", "competitions", "alumni", "countries"] as const;

export default function StatsCounter({ dict }: { dict: Dictionary }) {
  const { data } = useQuery(getSiteContent, {});
  // Angka disimpan di site_content key "stats_<nama>", dikelola admin.
  const value = (k: string) => data[`stats_${k}`]?.value_id ?? "–";

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
