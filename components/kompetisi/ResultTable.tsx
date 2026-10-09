import AwardBadges from "@/components/hof/AwardBadges";
import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Alumni, Result } from "@/types/database";

export default function ResultTable({
  results,
  lang,
  dict,
}: {
  results: (Result & { alumni: Alumni })[];
  lang: Locale;
  dict: Dictionary;
}) {
  const t = dict.competitionDetail;
  return (
    // Tabel bisa digeser horizontal di HP.
    <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
      <table className="w-full min-w-[28rem] text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3">{t.rank}</th>
            <th className="px-4 py-3">{t.name}</th>
            <th className="px-4 py-3">{t.medal}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {results.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3">{r.peringkat ?? "–"}</td>
              <td className="px-4 py-3">
                <Link href={`/${lang}/alumni/?slug=${r.alumni.slug}`} className="font-semibold hover:text-brand">
                  {r.alumni.nama}
                </Link>
              </td>
              <td className="px-4 py-3">
                {dict.medals[r.medali]}
                <AwardBadges awards={r} dict={dict} className="mt-1" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
