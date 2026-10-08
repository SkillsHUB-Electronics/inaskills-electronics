// Komponen kecil halaman Akun Saya: kartu, cincin persentase, dan ikon garis.

const paths = {
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8c0-3.3 3.1-5 7-5s7 1.7 7 5",
  star: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4m-4 3h8",
  medal: "M8 3l2.5 5M16 3l-2.5 5M12 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0-8.5l1 2 2 .3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L9 14.8l2-.3z",
  crown: "M4 18h16M5 15l-1-9 5 4 3-6 3 6 5-4-1 9z",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-6 9c0-3 2.7-5 6-5s6 2 6 5m1-9a3 3 0 1 0 0-6m2 15c0-2.4-1.2-4.2-3-5",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13v4l3 2",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z",
  bolt: "M13 3L5 13h6l-1 8 8-10h-6z",
  lock: "M6 11h12v9H6zm2 0V8a4 4 0 0 1 8 0v3",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4m-4-4h11",
  pin: "M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  building: "M4 21h16M5 21V10l7-5 7 5v11M9 21v-5h6v5M9 11h.01M15 11h.01",
  briefcase: "M4 8h16v11H4zm5 0V5h6v3M4 13h16",
  edit: "M4 20h4L19 9l-4-4L4 16zm9-13l4 4",
  external: "M14 4h6v6m0-6l-9 9M18 14v6H4V6h6",
  chevron: "M9 6l6 6-6 6",
  check: "M5 12l5 5 9-10",
  grid: "M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

export function Card({
  title,
  subtitle,
  icon,
  action,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  icon: IconName;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-2xl bg-white p-5 ring-1 ring-slate-200 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Icon name={icon} className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
          <div>
            <h2 className="font-bold">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
      <Icon name="edit" className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

// Cincin persentase (mis. kelengkapan profil).
export function Ring({ value, size = 88, dark = false }: { value: number; size?: number; dark?: boolean }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className={dark ? "stroke-white/15" : "stroke-slate-100"} />
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" strokeLinecap="round" className="stroke-brand" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-lg font-extrabold ${dark ? "text-white" : "text-ink"}`}>{value}%</span>
    </div>
  );
}
