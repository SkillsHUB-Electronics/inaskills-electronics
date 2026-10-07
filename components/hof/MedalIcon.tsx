const colors: Record<string, [string, string]> = {
  gold: ["#f5c542", "#b8860b"],
  silver: ["#e2e8f0", "#94a3b8"],
  bronze: ["#e8955a", "#a0522d"],
  moe: ["#7dd3fc", "#0284c7"],
};

// Ikon medali berpita, warnanya mengikuti jenis medali.
export default function MedalIcon({ medal, className = "h-9 w-9" }: { medal: string; className?: string }) {
  const [light, dark] = colors[medal] ?? colors.moe;
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M12 2h7l3 11h-7z" fill="#c8102e" />
      <path d="M28 2h-7l-3 11h7z" fill="#9b0c23" />
      <circle cx="20" cy="25" r="12" fill={dark} />
      <circle cx="20" cy="25" r="9.5" fill={light} />
      <path d="M20 19.5l1.7 3.5 3.8.5-2.8 2.6.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.6 3.8-.5z" fill={dark} opacity=".85" />
    </svg>
  );
}
