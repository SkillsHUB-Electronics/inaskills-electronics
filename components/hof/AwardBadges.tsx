import type { Dictionary } from "@/lib/i18n";

type Awards = { best_of_nation?: boolean | null; albert_vidal?: boolean | null };

// Lencana penghargaan khusus (Best of Nation, Albert Vidal Award); tidak tampil bila tidak ada.
export default function AwardBadges({ awards, dict, tone = "light", className = "" }: { awards: Awards; dict: Dictionary; tone?: "light" | "dark"; className?: string }) {
  const items = [
    awards.best_of_nation && dict.awards.bestOfNation,
    awards.albert_vidal && dict.awards.albertVidal,
  ].filter(Boolean) as string[];
  if (items.length === 0) return null;

  const style = tone === "dark" ? "bg-amber-400/15 text-amber-200 ring-amber-300/40" : "bg-amber-50 text-amber-800 ring-amber-300";
  return (
    <span className={`flex flex-wrap gap-1.5 ${className}`}>
      {items.map((label) => (
        <span key={label} className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${style}`}>
          <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="currentColor" aria-hidden="true">
            <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
          </svg>
          {label}
        </span>
      ))}
    </span>
  );
}
