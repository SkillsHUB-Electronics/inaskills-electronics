import type { Dictionary } from "@/lib/i18n";

// Judul gaya "— HALL OF FAME / JUARA ELEKTRONIKA".
export default function HofHeading({ dict, as: Tag = "h2" }: { dict: Dictionary; as?: "h1" | "h2" }) {
  return (
    <div>
      <p className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-brand">
        <span className="h-0.5 w-8 bg-brand" />
        {dict.hallOfFame.eyebrow}
      </p>
      <Tag className="mt-2 text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">{dict.hallOfFame.championsTitle}</Tag>
      <p className="mt-2 max-w-xl text-slate-600">{dict.hallOfFame.championsSubtitle}</p>
    </div>
  );
}
