"use client";

import { useState } from "react";
import Link from "next/link";
import MedalIcon from "@/components/hof/MedalIcon";
import LevelBadge from "@/components/ui/LevelBadge";
import { Icon, type IconName } from "@/components/akun/ui";
import { socialFields } from "@/components/akun/profile";
import { pick } from "@/lib/i18n";
import { hofMedals, internationalLevels, levelShort } from "@/lib/levels";
import { useLocale } from "@/lib/useLocale";
import type { AlumniDetail } from "@/lib/queries";

type Tab = "overview" | "history" | "skills" | "gallery" | "contact";
const tabs: { key: Tab; icon: IconName }[] = [
  { key: "overview", icon: "grid" },
  { key: "history", icon: "trophy" },
  { key: "skills", icon: "bolt" },
  { key: "gallery", icon: "grid" },
  { key: "contact", icon: "link" },
];

const box = "rounded-2xl bg-white p-5 ring-1 ring-slate-200";

function Box({ title, icon, action, children, className = "" }: { title: string; icon: IconName; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`${box} ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-bold">
          <Icon name={icon} className="h-5 w-5 text-ink" />
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {s}
        </span>
      ))}
    </div>
  );
}

export default function AlumniProfile({ data }: { data: AlumniDetail }) {
  const { lang, dict } = useLocale();
  const t = dict.alumniPage;
  const [tab, setTab] = useState<Tab>("overview");
  const { alumni: a, results } = data;

  const desc = [...results].sort((x, y) => y.competition.tahun - x.competition.tahun);
  const asc = [...desc].reverse();
  const skills = a.keahlian ?? [];
  const bio = pick(a, "bio", lang);
  const quote = pick(a, "quote", lang);
  const place = a.lokasi || a.asal_daerah;
  const since = asc[0]?.competition.tahun ?? null;
  const direct = [
    a.kontak_email && { key: "email", label: "Email", href: `mailto:${a.kontak_email}`, text: a.kontak_email },
    a.kontak_telepon && { key: "phone", label: t.phone, href: `tel:${a.kontak_telepon.replace(/[^+\d]/g, "")}`, text: a.kontak_telepon },
  ].filter(Boolean) as { key: string; label: string; href: string; text: string }[];
  const links = [
    ...socialFields.map((s) => ({ ...s, href: a[s.key] })).filter((s) => s.href),
  ] as { key: string; label: string; color: string; href: string }[];
  const gallery = desc.filter((r) => r.foto_url).map((r) => ({ url: r.foto_url as string, label: pick(r.competition, "nama", lang) }));
  const stats = [
    { icon: "trophy" as IconName, value: new Set(results.map((r) => r.competition_id)).size, label: t.competitions },
    { icon: "medal" as IconName, value: results.filter((r) => ["gold", "silver", "bronze"].includes(r.medali)).length, label: t.medals },
    { icon: "crown" as IconName, value: results.filter((r) => internationalLevels.includes(r.competition.level)).length, label: t.international },
  ];

  const compHref = (slug: string) => `/${lang}/kompetisi/detail/?slug=${slug}`;
  const achievement = (r: (typeof desc)[number]) => (
    <Link key={r.id} href={compHref(r.competition.slug)} className="flex items-center gap-3 rounded-xl p-3 ring-1 ring-slate-100 hover:bg-slate-50">
      {(hofMedals as readonly string[]).includes(r.medali) ? <MedalIcon medal={r.medali} className="h-9 w-9 shrink-0" /> : <Icon name="trophy" className="h-8 w-8 shrink-0 text-slate-400" />}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{pick(r.competition, "nama", lang)}</p>
        <LevelBadge level={r.competition.level} label={levelShort[r.competition.level]} />
      </div>
      <span className="shrink-0 text-sm font-semibold text-brand">{dict.medals[r.medali]}</span>
    </Link>
  );

  const aboutBox = (
    <Box title={t.aboutMe} icon="user">
      {bio ? <p className="whitespace-pre-line text-slate-700">{bio}</p> : <p className="text-sm text-slate-500">{t.noData}</p>}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-slate-50 p-3 text-center">
            <Icon name={s.icon} className="mx-auto h-5 w-5 text-brand" />
            <p className="mt-1 text-xl font-extrabold">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
    </Box>
  );
  const infoRows: [string, string | null | undefined][] = [
    [t.fullName, a.nama],
    [t.location, place],
    [t.institution, a.instansi],
    [t.role, a.pekerjaan],
    ["Email", a.kontak_email],
    [t.phone, a.kontak_telepon],
  ];
  const infoBox = (
    <Box title={t.personalInfo} icon="user">
      <dl className="divide-y divide-slate-100 text-sm">
        {infoRows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex gap-3 py-2.5">
            <dt className="w-24 shrink-0 text-slate-500">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
        {links.length > 0 && (
          <div className="flex items-center gap-3 py-2.5">
            <dt className="w-24 shrink-0 text-slate-500">{t.social}</dt>
            <dd className="flex gap-2">
              {links.map((l) => (
                <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} className={`h-6 w-6 rounded-full ${l.color}`} />
              ))}
            </dd>
          </div>
        )}
      </dl>
    </Box>
  );
  const skillsBox = (
    <Box title={t.skills} icon="bolt">
      {skills.length ? <Chips items={skills} /> : <p className="text-sm text-slate-500">{t.noData}</p>}
    </Box>
  );
  const galleryGrid = (items: typeof gallery) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((g, i) => (
        <figure key={i} className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={g.url} alt={g.label} loading="lazy" className="h-full w-full object-cover" />
        </figure>
      ))}
    </div>
  );
  const contactBox = (
    <Box title={t.contact} icon="link">
      {links.length || direct.length ? (
        <ul className="divide-y divide-slate-100">
          {direct.map((d) => (
            <li key={d.key}>
              <a href={d.href} className="flex items-center gap-3 py-2.5 hover:text-brand">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">{d.key === "email" ? "@" : "☎"}</span>
                <span className="w-20 shrink-0 text-sm font-semibold">{d.label}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-slate-500">{d.text}</span>
                <Icon name="chevron" className="h-4 w-4 shrink-0 text-slate-400" />
              </a>
            </li>
          ))}
          {links.map((l) => (
            <li key={l.key}>
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-2.5 hover:text-brand">
                <span className={`h-6 w-6 shrink-0 rounded-full ${l.color}`} />
                <span className="w-20 shrink-0 text-sm font-semibold">{l.label}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-slate-500">{l.href.replace(/^https?:\/\//, "")}</span>
                <Icon name="chevron" className="h-4 w-4 shrink-0 text-slate-400" />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{t.noData}</p>
      )}
    </Box>
  );

  return (
    <div className="bg-slate-50">
      <header className="bg-gradient-to-br from-sky-50 via-white to-red-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1fr_20rem] lg:py-14">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
            <div className="h-36 w-36 shrink-0 overflow-hidden rounded-full bg-slate-200 ring-4 ring-white shadow-lg sm:h-44 sm:w-44">
              {a.foto_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.foto_url} alt={a.nama} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold text-ink">{a.nama}</h1>
              <span className="mt-2 inline-block rounded-md bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">{t.badge}</span>
              {(a.pekerjaan || a.instansi) && <p className="mt-2 font-semibold text-brand">{[a.pekerjaan, a.instansi].filter(Boolean).join(" - ")}</p>}
              <p className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-slate-600 sm:justify-start">
                {place && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="pin" className="h-4 w-4" />
                    {place}
                  </span>
                )}
                {since && (
                  <span className="flex items-center gap-1.5">
                    <Icon name="briefcase" className="h-4 w-4" />
                    {t.alumniSince.replace("{year}", String(since))}
                  </span>
                )}
              </p>
              {bio && <p className="mt-3 line-clamp-3 max-w-2xl whitespace-pre-line text-slate-700">{bio}</p>}
              {skills.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {skills.slice(0, 6).map((s) => (
                    <span key={s} className="rounded-full bg-white px-3 py-1 text-sm font-semibold ring-1 ring-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200">
            <h2 className="flex items-center gap-2 font-bold">
              <Icon name="trophy" className="h-5 w-5 text-brand" />
              {t.journey}
            </h2>
            {asc.length ? (
              <ul className="mt-3 space-y-2">
                {asc.slice(0, 4).map((r) => (
                  <li key={r.id}>
                    <Link href={compHref(r.competition.slug)} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 ring-1 ring-slate-100 hover:bg-slate-50">
                      <span>
                        <span className="block text-sm font-semibold">{levelShort[r.competition.level]}</span>
                        <span className="text-xs text-slate-500">{r.competition.tahun}</span>
                      </span>
                      <span className="text-xs font-semibold text-slate-600">{dict.medals[r.medali]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">{t.noJourney}</p>
            )}
            {quote && <p className="mt-3 rounded-xl bg-sky-50 px-4 py-3 text-sm italic text-slate-700">“{quote}”</p>}
          </aside>
        </div>
      </header>

      <div className="border-y border-slate-200 bg-white">
        <div role="tablist" className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
          {tabs.map(({ key, icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-semibold ${tab === key ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-ink"}`}
            >
              <Icon name={icon} className="h-4 w-4" />
              {t.tabs[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {tab === "overview" && (
          <div className="grid gap-5 lg:grid-cols-[18rem_1fr_20rem]">
            {infoBox}
            <div className="space-y-5">
              {aboutBox}
              <Box
                title={t.latest}
                icon="trophy"
                action={desc.length > 3 && <button onClick={() => setTab("history")} className="text-xs font-semibold text-brand hover:underline">{t.viewAll}</button>}
              >
                {desc.length ? <div className="space-y-2">{desc.slice(0, 3).map(achievement)}</div> : <p className="text-sm text-slate-500">{t.noJourney}</p>}
              </Box>
            </div>
            <div className="space-y-5">
              {skillsBox}
              {gallery.length > 0 && (
                <Box title={t.gallery} icon="grid" action={gallery.length > 4 && <button onClick={() => setTab("gallery")} className="text-xs font-semibold text-brand hover:underline">{t.viewAll}</button>}>
                  {galleryGrid(gallery.slice(0, 4))}
                </Box>
              )}
              {contactBox}
            </div>
          </div>
        )}
        {tab === "history" && (
          <Box title={t.tabs.history} icon="trophy">
            {desc.length ? <div className="space-y-2">{desc.map(achievement)}</div> : <p className="text-sm text-slate-500">{t.noJourney}</p>}
          </Box>
        )}
        {tab === "skills" && skillsBox}
        {tab === "gallery" && (
          <Box title={t.gallery} icon="grid">
            {gallery.length ? galleryGrid(gallery) : <p className="text-sm text-slate-500">{t.noData}</p>}
          </Box>
        )}
        {tab === "contact" && contactBox}
      </div>
    </div>
  );
}
