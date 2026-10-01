import { levelColors, type Level } from "@/lib/levels";

export default function LevelBadge({ level, label }: { level: Level; label: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelColors[level]}`}>
      {label}
    </span>
  );
}
