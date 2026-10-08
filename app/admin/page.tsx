"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminIcon, { type IconName } from "@/components/admin/AdminIcon";
import { countUnreadMessages } from "@/lib/adminInbox";
import { useAdminLang, type AdminTexts } from "@/lib/adminLang";
import { dateRange, place } from "@/lib/competition";
import type { Locale } from "@/lib/i18n";
import { internationalLevels, levelColors, levelShort, type Level } from "@/lib/levels";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";
import type { Competition, Medal } from "@/types/database";

type Counts = { alumni: number; alumniYear: number; kompetisi: number; kompetisiYear: number; sponsor: number; sponsorActive: number; pesan: number; unread: number };
type LatestCompetition = Pick<Competition, "id" | "nama_id" | "nama_en" | "level" | "tahun" | "kota" | "negara" | "tanggal_mulai" | "tanggal_selesai" | "logo_url"> & { peserta: number };
type ActivityKind = keyof AdminTexts["act"];
type Activity = { kind: ActivityKind; title: string; at: string; href: string };
type ResultRow = { medali: Medal; competition: { id: string; level: Level; tahun: number } | null };
type Data = { counts: Counts; competitions: LatestCompetition[]; activity: Activity[]; results: ResultRow[] };

async function count(table: string, filter?: (q: any) => any): Promise<number> { // eslint-disable-line @typescript-eslint/no-explicit-any
  let q = supabase!.from(table).select("*", { count: "exact", head: true });
  if (filter) q = filter(q);
  const { count: n } = await q;
  return n ?? 0;
}

async function loadDashboard(): Promise<Data> {
  const db = supabase!;
  const yearStart = `${new Date().getFullYear()}-01-01`;
  const recent = (table: string, columns: string) => db.from(table).select(columns).order("created_at", { ascending: false }).limit(5);

  const [alumni, alumniYear, kompetisi, kompetisiYear, sponsor, sponsorActive, pesan, unread, comps, results, a, c, r, n, p, m] = await Promise.all([
    count("alumni"),
    count("alumni", (q) => q.gte("created_at", yearStart)),
    count("competitions"),
    count("competitions", (q) => q.gte("created_at", yearStart)),
    count("sponsors"),
    count("sponsors", (q) => q.eq("aktif", true)),
    count("contact_messages"),
    countUnreadMessages(),
    db
      .from("competitions")
      .select("id, nama_id, nama_en, level, tahun, kota, negara, tanggal_mulai, tanggal_selesai, logo_url, results(count)")
      .order("tahun", { ascending: false })
      .order("tanggal_mulai", { ascending: false, nullsFirst: false })
      .limit(5),
    db.from("results").select("medali, competition:competitions(id, level, tahun)"),
    recent("alumni", "id, nama, created_at"),
    recent("competitions", "id, nama_id, created_at"),
    recent("results", "id, created_at, alumni:alumni(nama), competition:competitions(nama_id)"),
    recent("news", "id, judul_id, created_at"),
    recent("projects", "id, judul_id, created_at"),
    recent("contact_messages", "id, nama, perusahaan, created_at"),
  ]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows = (res: { data: unknown }) => (res.data ?? []) as any[];
  const activity: Activity[] = [
    ...rows(a).map((x) => ({ kind: "alumni" as const, title: x.nama, at: x.created_at, href: "/admin/alumni/" })),
    ...rows(c).map((x) => ({ kind: "competition" as const, title: x.nama_id, at: x.created_at, href: "/admin/kompetisi/" })),
    ...rows(r).map((x) => ({
      kind: "result" as const,
      title: [x.alumni?.nama, x.competition?.nama_id].filter(Boolean).join(" · "),
      at: x.created_at,
      href: "/admin/hall-of-fame/",
    })),
    ...rows(n).map((x) => ({ kind: "news" as const, title: x.judul_id, at: x.created_at, href: "/admin/berita/" })),
    ...rows(p).map((x) => ({ kind: "project" as const, title: x.judul_id, at: x.created_at, href: "/admin/proyek/" })),
    ...rows(m).map((x) => ({ kind: "message" as const, title: [x.nama, x.perusahaan].filter(Boolean).join(" · "), at: x.created_at, href: "/admin/pesan/" })),
  ]
    .filter((x) => x.at)
    .sort((x, y) => y.at.localeCompare(x.at))
    .slice(0, 6);

  return {
    counts: { alumni, alumniYear, kompetisi, kompetisiYear, sponsor, sponsorActive, pesan, unread },
    competitions: rows(comps).map(({ results: rc, ...x }) => ({ ...x, peserta: rc?.[0]?.count ?? 0 })),
    activity,
    results: rows(results),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

function timeAgo(iso: string, lang: Locale): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(lang === "id" ? "id-ID" : "en-GB", { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["second", 60],
    ["minute", 60],
    ["hour", 24],
    ["day", 30],
    ["month", 12],
    ["year", Infinity],
  ];
  let value = diff;
  for (const [unit, size] of steps) {
    if (Math.abs(value) < size) return rtf.format(Math.round(value), unit);
    value /= size;
  }
  return "";
}

const card = "min-w-0 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70";

function CardTitle({ icon, title, href, link }: { icon: IconName; title: string; href?: string; link?: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <AdminIcon name={icon} className="h-5 w-5 text-blue-600" />
      <h2 className="flex-1 font-bold">{title}</h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
          {link} <AdminIcon name="arrow" className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

const statStyles = [
  { key: "alumni", href: "/admin/alumni/", icon: "alumni", circle: "bg-blue-500", glow: "from-blue-50" },
  { key: "kompetisi", href: "/admin/kompetisi/", icon: "hof", circle: "bg-amber-400", glow: "from-amber-50" },
  { key: "sponsor", href: "/admin/sponsor/", icon: "sponsor", circle: "bg-brand", glow: "from-red-50" },
  { key: "pesan", href: "/admin/pesan/", icon: "pesan", circle: "bg-violet-500", glow: "from-violet-50" },
] as const;

const medalColors: Record<"gold" | "silver" | "bronze" | "moe", string> = { gold: "#f59e0b", silver: "#94a3b8", bronze: "#c2672d", moe: "#3b82f6" };
const medalKeys = ["gold", "silver", "bronze", "moe"] as const;

function MedalDonut({ results, t }: { results: ResultRow[]; t: AdminTexts }) {
  const totals = medalKeys.map((k) => results.filter((r) => r.medali === k).length);
  const total = totals.reduce((s, n) => s + n, 0);
  const r = 15.9155; // keliling = 100
  const pcts = totals.map((n) => (total ? (n / total) * 100 : 0));
  const starts = pcts.map((_, i) => pcts.slice(0, i).reduce((s, n) => s + n, 0));
  return (
    <div className={card}>
      <CardTitle icon="medal" title={t.medalDist} href="/admin/hall-of-fame/" link={t.seeDetail} />
      {total === 0 ? (
        <p className="text-sm text-slate-500">{t.noMedals}</p>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative h-36 w-36 shrink-0">
            <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
              <circle cx="21" cy="21" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
              {pcts.map((pct, i) =>
                pct ? (
                  <circle key={medalKeys[i]} cx="21" cy="21" r={r} fill="none" stroke={medalColors[medalKeys[i]]} strokeWidth="6" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-starts[i]} />
                ) : null,
              )}
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-2xl font-extrabold">{total}</p>
                <p className="text-[11px] text-slate-500">{t.totalMedals}</p>
              </div>
            </div>
          </div>
          <ul className="w-full space-y-2.5 text-sm">
            {medalKeys.map((k, i) => (
              <li key={k} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: medalColors[k] }} />
                <span className="flex-1 text-slate-600">{t.medals[k]}</span>
                <span className="font-semibold">{totals[i]}</span>
                <span className="w-12 text-right text-xs text-slate-400">{Math.round((totals[i] / total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Performance({ results, t }: { results: ResultRow[]; t: AdminTexts }) {
  // Satu baris per ajang internasional (WSI/WSA/ASC), terbaru dulu.
  const byComp = new Map<string, { level: Level; tahun: number; m: Record<string, number>; peserta: number }>();
  for (const r of results) {
    const c = r.competition;
    if (!c || !internationalLevels.includes(c.level)) continue;
    const row = byComp.get(c.id) ?? { level: c.level, tahun: c.tahun, m: {}, peserta: 0 };
    row.peserta++;
    row.m[r.medali] = (row.m[r.medali] ?? 0) + 1;
    byComp.set(c.id, row);
  }
  const rows = [...byComp.values()].sort((a, b) => b.tahun - a.tahun).slice(0, 6);
  return (
    <div className={card}>
      <CardTitle icon="hof" title={t.performance} href="/admin/hall-of-fame/" link={t.seeDetail} />
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">{t.noMedals}</p>
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs text-slate-500">
                <th className="rounded-l-lg px-2 py-2 font-semibold">{t.year}</th>
                <th className="px-2 py-2 font-semibold">{t.event}</th>
                <th className="px-2 py-2 font-semibold">{t.medal}</th>
                <th className="rounded-r-lg px-2 py-2 text-right font-semibold">{t.team}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  <td className="whitespace-nowrap px-2 py-2.5 font-semibold">
                    <span className="mr-1.5 inline-block h-2.5 w-3.5 overflow-hidden rounded-[2px] align-middle ring-1 ring-slate-200">
                      <span className="block h-1/2 bg-red-600" />
                      <span className="block h-1/2 bg-white" />
                    </span>
                    {row.tahun}
                  </td>
                  <td className="px-2 py-2.5">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${levelColors[row.level]}`}>{levelShort[row.level]}</span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span className="flex gap-3">
                      {medalKeys.map((k) => (
                        <span key={k} className="flex items-center gap-1 tabular-nums" title={t.medals[k]}>
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: medalColors[k] }} />
                          {row.m[k] ?? 0}
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums">{row.peserta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const activityIcon: Record<ActivityKind, { icon: IconName; color: string }> = {
  alumni: { icon: "alumni", color: "bg-blue-100 text-blue-600" },
  competition: { icon: "kompetisi", color: "bg-emerald-100 text-emerald-600" },
  result: { icon: "hof", color: "bg-amber-100 text-amber-600" },
  news: { icon: "berita", color: "bg-sky-100 text-sky-600" },
  project: { icon: "proyek", color: "bg-teal-100 text-teal-600" },
  message: { icon: "pesan", color: "bg-violet-100 text-violet-600" },
};

export default function AdminDashboard() {
  const { lang, t } = useAdminLang();
  const { session } = useSession();
  const [data, setData] = useState<Data | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!supabase) return;
    loadDashboard().then(setData);
  }, []);

  useEffect(() => {
    if (!session) return;
    supabase
      ?.from("profiles")
      .select("nama")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data: p }) => setName(p?.nama || session.user.email?.split("@")[0] || "Admin"));
  }, [session]);

  const c = data?.counts;
  const subs: Record<(typeof statStyles)[number]["key"], string> = {
    alumni: c ? t.thisYear(c.alumniYear) : "",
    kompetisi: c ? t.thisYear(c.kompetisiYear) : "",
    sponsor: c ? t.activeSponsors(c.sponsorActive) : "",
    pesan: c ? t.unread(c.unread) : "",
  };
  const today = new Date().toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const levelLabel = (l: Level) => (l === "nasional" ? t.nasional : levelShort[l]);
  const quick = [
    { label: t.qa.alumni, href: "/admin/alumni/", icon: "alumni", color: "bg-blue-50 text-blue-600" },
    { label: t.qa.kompetisi, href: "/admin/kompetisi/", icon: "hof", color: "bg-amber-50 text-amber-600" },
    { label: t.qa.berita, href: "/admin/berita/", icon: "berita", color: "bg-emerald-50 text-emerald-600" },
    { label: t.qa.sponsor, href: "/admin/sponsor/", icon: "sponsor", color: "bg-violet-50 text-violet-600" },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{t.menu.dashboard}</h1>
          <p className="mt-1 text-sm text-slate-600">{t.welcomeBack(name || "Admin")}</p>
        </div>
        <p className="flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200/70">
          <AdminIcon name="calendar" className="h-4 w-4 text-slate-500" />
          {today}
        </p>
      </div>

      {/* Kartu statistik */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statStyles.map((s) => (
          <Link key={s.key} href={s.href} className={`${card} flex items-center gap-3 bg-gradient-to-br ${s.glow} to-white to-60% transition hover:shadow-md sm:gap-4`}>
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-white sm:h-14 sm:w-14 ${s.circle}`}>
              <AdminIcon name={s.icon} className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-600">{t.stats[s.key]}</span>
              <span className="block text-2xl font-extrabold sm:text-3xl">{c ? c[s.key] : "–"}</span>
              <span className="block truncate text-xs text-slate-500">{subs[s.key] || " "}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kompetisi terbaru */}
        <div className={`${card} lg:col-span-2`}>
          <CardTitle icon="kompetisi" title={t.latestCompetitions} href="/admin/kompetisi/" link={t.seeAll} />
          {data && data.competitions.length === 0 && <p className="text-sm text-slate-500">{t.noCompetitions}</p>}
          <ul className="divide-y divide-slate-100">
            {(data?.competitions ?? []).map((comp) => (
              <li key={comp.id}>
                <Link href="/admin/kompetisi/" className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-slate-50">
                  {comp.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={comp.logo_url} alt="" className="h-12 w-12 shrink-0 rounded-lg bg-white object-contain ring-1 ring-slate-200" />
                  ) : (
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg text-xs font-bold ${levelColors[comp.level]}`}>{levelShort[comp.level].slice(0, 3)}</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold">{(lang === "en" && comp.nama_en) || comp.nama_id}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${levelColors[comp.level]}`}>{levelLabel(comp.level)}</span>
                    </span>
                    <span className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <AdminIcon name="calendar" className="h-3.5 w-3.5" />
                        {dateRange(comp, lang) || comp.tahun}
                      </span>
                      {place(comp) && (
                        <span className="flex items-center gap-1">
                          <AdminIcon name="pin" className="h-3.5 w-3.5" />
                          {place(comp)}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-xs font-medium text-slate-500 sm:block">{t.participants(comp.peserta)}</span>
                  <AdminIcon name="chevron" className="h-4 w-4 shrink-0 text-slate-400" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 space-y-6">
          {/* Kartu sambutan */}
          <div className="relative overflow-hidden rounded-2xl bg-ink p-5 text-white shadow-sm">
            <svg viewBox="0 0 200 120" className="pointer-events-none absolute -right-6 -top-2 h-40 w-64 text-white/10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M10 100h50l20-20h40l20-30h50M60 100v-30h30M120 80v30M140 50V10M160 50h30" />
              <circle cx="60" cy="70" r="3" fill="currentColor" />
              <circle cx="140" cy="10" r="3" fill="currentColor" />
              <circle cx="190" cy="50" r="3" fill="currentColor" />
              <circle cx="120" cy="110" r="3" fill="currentColor" />
            </svg>
            <span className="absolute right-0 top-0 h-full w-1.5 bg-brand" />
            <p className="relative text-sm text-white/70">{t.welcome}</p>
            <p className="relative mt-1 text-xl font-bold">{name || "Admin"}</p>
            <p className="relative text-sm text-white/60">{t.administrator}</p>
            <p className="relative mt-4 text-sm italic text-white/80">{t.quote}</p>
          </div>

          {/* Aksi cepat */}
          <div className={card}>
            <CardTitle icon="bolt" title={t.quickActions} />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 xl:grid-cols-2">
              {quick.map((q) => (
                <Link key={q.label} href={q.href} className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold transition hover:brightness-95 sm:text-sm ${q.color}`}>
                  <AdminIcon name={q.icon} className="h-5 w-5 shrink-0" />
                  <span className="flex-1 text-ink">{q.label}</span>
                  <AdminIcon name="chevron" className="h-4 w-4 shrink-0 opacity-60" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Aktivitas terbaru */}
        <div className={card}>
          <CardTitle icon="clock" title={t.activity} />
          {data && data.activity.length === 0 && <p className="text-sm text-slate-500">{t.noActivity}</p>}
          <ul className="space-y-1">
            {(data?.activity ?? []).map((a, i) => (
              <li key={i}>
                <Link href={a.href} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${activityIcon[a.kind].color}`}>
                    <AdminIcon name={activityIcon[a.kind].icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{t.act[a.kind]}</span>
                    <span className="block truncate text-xs text-slate-500">{a.title}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(a.at, lang)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <MedalDonut results={data?.results ?? []} t={t} />
        <div className="min-w-0 lg:col-span-2 xl:col-span-1">
          <Performance results={data?.results ?? []} t={t} />
        </div>
      </div>
    </div>
  );
}
