import { levels, type Level } from "@/lib/levels";
import type { Dictionary } from "@/lib/i18n";

export default function LevelFilter({
  value,
  onChange,
  dict,
}: {
  value: Level | "all";
  onChange: (v: Level | "all") => void;
  dict: Dictionary;
}) {
  const options: (Level | "all")[] = ["all", ...levels];
  return (
    // Scroll horizontal di HP agar tombol tidak turun ke banyak baris.
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
            value === o ? "bg-ink text-white ring-ink" : "bg-white text-slate-700 ring-slate-300 hover:ring-ink"
          }`}
        >
          {o === "all" ? dict.common.all : dict.levels[o]}
        </button>
      ))}
    </div>
  );
}
