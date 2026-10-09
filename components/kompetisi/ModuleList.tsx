import { pick, type Locale } from "@/lib/i18n";
import type { CompetitionModule } from "@/types/database";

export default function ModuleList({ modules, lang }: { modules: CompetitionModule[]; lang: Locale }) {
  return (
    <ol className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {modules.map((m, i) => {
        const desc = pick(m, "deskripsi", lang);
        return (
          <li key={m.id} className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
            <div className="min-w-0">
              <h3 className="font-semibold">{pick(m, "judul", lang)}</h3>
              {desc && <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{desc}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
