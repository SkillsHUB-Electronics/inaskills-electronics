import Link from "next/link";
import { pick, type Dictionary, type Locale } from "@/lib/i18n";
import type { Project } from "@/types/database";

export default function ProjectCard({ p, lang, dict }: { p: Project; lang: Locale; dict: Dictionary }) {
  const t = dict.projects;
  const links = [
    { href: p.repo_url, label: t.repo },
    { href: p.demo_url, label: t.demo },
    { href: p.file_url, label: t.download },
  ].filter((l) => l.href);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
      {p.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.cover_url} alt="" className="aspect-video w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {t.categories[p.kategori]}
          </span>
          {p.status === "under_development" && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              {t.underDevelopment}
            </span>
          )}
        </div>
        <h3 className="mt-3 font-semibold">{pick(p, "judul", lang)}</h3>
        <p className="mt-1 line-clamp-3 text-sm text-slate-600">{pick(p, "deskripsi", lang)}</p>
        <p className="mt-2 text-xs text-slate-500">
          {p.alumni && (
            <>
              {t.by}{" "}
              <Link href={`/${lang}/alumni/?slug=${p.alumni.slug}`} className="font-semibold hover:text-brand">
                {p.alumni.nama}
              </Link>
              {p.tahun && " · "}
            </>
          )}
          {p.tahun}
        </p>
        {links.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href!}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-4 py-1.5 text-sm font-semibold text-ink ring-1 ring-slate-300 hover:bg-ink hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
