import Link from "next/link";
import { pick, type Dictionary, type Locale } from "@/lib/i18n";
import type { News } from "@/types/database";

export function formatDate(date: string, lang: Locale) {
  return new Date(date).toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function NewsCard({ n, lang, dict }: { n: News; lang: Locale; dict: Dictionary }) {
  return (
    <Link
      href={`/${lang}/berita/baca/?slug=${n.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:shadow-lg"
    >
      <div className="aspect-video overflow-hidden bg-gradient-to-br from-ink-soft to-ink">
        {n.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={n.cover_url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <time className="text-xs font-semibold uppercase tracking-wide text-brand">{formatDate(n.tanggal, lang)}</time>
        <h3 className="mt-2 font-semibold group-hover:text-brand">{pick(n, "judul", lang)}</h3>
        <p className="mt-1 line-clamp-3 text-sm text-slate-600">{pick(n, "ringkasan", lang)}</p>
        <span className="mt-auto pt-4 text-sm font-semibold text-ink">{dict.newsSection.readMore} →</span>
      </div>
    </Link>
  );
}
