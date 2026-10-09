import Link from "next/link";
import { place } from "@/lib/competition";
import { pick, type Dictionary, type Locale } from "@/lib/i18n";
import type { ExpertDetail } from "@/types/database";

// Kartu expert bergaya sama dengan kartu juara: tahun terakhir di kiri, foto di kanan, nama di bawah.
export default function ExpertCard({ expert, lang, dict }: { expert: ExpertDetail; lang: Locale; dict: Dictionary }) {
  const photo = expert.foto_url || expert.alumni?.foto_url;
  const org = expert.instansi || expert.alumni?.instansi;
  const job = expert.pekerjaan || expert.alumni?.pekerjaan;
  const latest = [...expert.competition_experts].sort((a, b) => b.competition.tahun - a.competition.tahun)[0]?.competition;
  const count = expert.competition_experts.length;

  return (
    <Link
      href={`/${lang}/expert/?slug=${expert.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-ink text-white shadow-md ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:shadow-xl hover:ring-brand/60"
    >
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-ink-soft to-ink">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={expert.nama} className="absolute inset-y-0 right-0 h-full w-3/5 object-cover object-top transition duration-300 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
        <div className="relative flex h-full max-w-[65%] flex-col p-4">
          {latest ? (
            <>
              <p className="text-3xl font-extrabold leading-none">{latest.tahun}</p>
              <p className="mt-1 truncate text-xs text-white/70">{place(latest) || pick(latest, "nama", lang)}</p>
            </>
          ) : null}
          <div className="mt-auto">
            <span className="text-[11px] font-bold uppercase tracking-wide text-sky-300">{dict.expertPage.eyebrow}</span>
            {count > 0 && (
              <p className="text-xs text-white/70">
                {count} {dict.expertPage.competitionsCount}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-white/10 p-4">
        <p className="truncate font-bold">{expert.nama}</p>
        <p className="truncate text-xs text-white/60">{[job, org].filter(Boolean).join(" · ") || "Electronics"}</p>
        <span className="mt-2 self-end text-xs font-semibold text-white/80 group-hover:text-brand">{dict.expertPage.viewProfile} →</span>
      </div>
    </Link>
  );
}
