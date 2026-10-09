import type { CompetitionPartner } from "@/types/database";

export default function PartnerList({ partners }: { partners: CompetitionPartner[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {partners.map((p) => {
        const body = (
          <>
            <span className="flex h-16 w-full items-center justify-center">
              {p.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logo_url} alt={p.nama} loading="lazy" className="max-h-full max-w-full object-contain" />
              ) : null}
            </span>
            <span className="text-center text-sm font-semibold">{p.nama}</span>
          </>
        );
        const cls = "flex h-full flex-col items-center gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200";
        return (
          <li key={p.id}>
            {p.website ? (
              <a href={p.website} target="_blank" rel="noopener noreferrer" className={`${cls} hover:bg-slate-50`}>
                {body}
              </a>
            ) : (
              <div className={cls}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
