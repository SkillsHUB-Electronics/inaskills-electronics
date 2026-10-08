"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Section from "@/components/ui/Section";
import LevelBadge from "@/components/ui/LevelBadge";
import ProfileEditor from "@/components/akun/ProfileEditor";
import { Card, EditButton, Icon, Ring, type IconName } from "@/components/akun/ui";
import { completion, emptyProfile, journeyStats, socialFields, toProfile, type LinkedAlumni, type Profile } from "@/components/akun/profile";
import { isAdmin, signOut } from "@/lib/auth";
import { pick } from "@/lib/i18n";
import { levelShort } from "@/lib/levels";
import { supabase } from "@/lib/supabase";
import { useContact } from "@/lib/useContact";
import { useLocale } from "@/lib/useLocale";
import { useSession } from "@/lib/useSession";

const stateStyle = { done: "text-emerald-600", partial: "text-sky-600", pending: "text-slate-400" };

export default function AccountPage() {
  const router = useRouter();
  const { lang, dict } = useLocale();
  const t = dict.account;
  const { session, loading } = useSession();
  const { whatsapp, email: contactEmail } = useContact();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [alumni, setAlumni] = useState<LinkedAlumni | null>(null);
  const [admin, setAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const closeEditor = useCallback(() => setEditing(false), []);

  useEffect(() => {
    if (!loading && !session) router.replace(`/${lang}/login/`);
  }, [loading, session, router, lang]);

  useEffect(() => {
    if (!session || !supabase) return;
    const uid = session.user.id;
    isAdmin().then(setAdmin);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle()
      .then(({ data }) => setProfile(toProfile(data)));
    // Riwayat kompetisi datang dari data alumni yang dihubungkan admin ke akun ini.
    supabase
      .from("alumni")
      .select("slug, results(medali, competition:competitions(id, nama_id, nama_en, tahun, level))")
      .eq("user_id", uid)
      .maybeSingle()
      .then(({ data }) => setAlumni(data as LinkedAlumni | null));
  }, [session]);

  if (loading || !session) return <Section><p className="text-slate-500">{dict.common.loading}</p></Section>;
  const user = session.user;
  const name = profile.nama || user.email || "";
  const { items, percent } = completion(profile, alumni);
  const stats = journeyStats(alumni?.results ?? []);
  const verified = Boolean(user.email_confirmed_at);
  const joined = profile.created_at || user.created_at;
  const memberSince = t.memberSince.replace("{year}", String(new Date(joined).getFullYear()));
  const badge = admin ? t.adminBadge : alumni ? t.alumniBadge : t.member;
  const publicUrl = alumni ? `/${lang}/alumni/?slug=${alumni.slug}` : null;
  const socials = socialFields.filter((s) => profile[s.key]);
  const fmt = new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", { dateStyle: "medium", timeStyle: "short" });

  const linkText = encodeURIComponent(t.linkMessage.replace("{email}", user.email ?? ""));
  const linkHref = whatsapp ? `https://wa.me/${whatsapp}?text=${linkText}` : contactEmail ? `mailto:${contactEmail}?body=${linkText}` : null;

  // Aktivitas dari data yang memang tercatat: login terakhir, profil diubah, tanggal daftar.
  const activity = [
    { at: user.last_sign_in_at, title: t.actSignIn, text: t.actSignInText, icon: "lock" as IconName, color: "bg-sky-600" },
    profile.updated_at && profile.created_at && Date.parse(profile.updated_at) - Date.parse(profile.created_at) > 60_000
      ? { at: profile.updated_at, title: t.actUpdated, text: t.actUpdatedText, icon: "user" as IconName, color: "bg-brand" }
      : null,
    { at: joined, title: t.actJoined, text: t.actJoinedText, icon: "check" as IconName, color: "bg-emerald-600" },
  ].filter((a): a is NonNullable<typeof a> & { at: string } => Boolean(a?.at));
  activity.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    const { error } = (await supabase?.auth.updateUser({ password })) ?? { error: null };
    setPassword("");
    setStatus(error ? dict.auth.failed + error.message : t.saved);
    if (!error) setShowPassword(false);
  }

  async function logout() {
    await signOut();
    router.replace(`/${lang}/`);
  }

  const edit = () => setEditing(true);
  const openPassword = () => {
    setShowPassword(true);
    document.getElementById("keamanan")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const journey: { icon: IconName; label: string; value: React.ReactNode; unit: string; href: string | null; tint: string }[] = [
    { icon: "trophy", label: t.participation, value: stats.competitions, unit: t.competitionsUnit, href: publicUrl ?? `/${lang}/kompetisi/`, tint: "text-brand" },
    { icon: "medal", label: t.medals, value: stats.medals, unit: t.medalsUnit, href: publicUrl, tint: "text-amber-500" },
    { icon: "crown", label: t.hof, value: stats.hof, unit: t.hofUnit, href: `/${lang}/hall-of-fame/`, tint: "text-amber-500" },
    {
      icon: "users",
      label: t.alumniStatus,
      value: <span className="text-sm">{stats.since ? t.alumniSince.replace("{year}", String(stats.since)) : alumni ? t.alumniBadge : t.notAlumni}</span>,
      unit: "",
      href: publicUrl,
      tint: "text-ink",
    },
  ];

  return (
    <div className="bg-slate-50 px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.title}</h1>
        <nav className="mt-1 text-sm text-slate-500">
          <Link href={`/${lang}/`} className="hover:text-brand">{t.home}</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{t.title}</span>
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {/* Banner profil */}
            <section className="relative overflow-hidden rounded-2xl bg-ink p-5 text-white sm:p-7">
              <svg viewBox="0 0 400 200" className="pointer-events-none absolute right-0 top-0 h-full w-2/3 text-white/10" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M20 40h120l30 30h90l20-20h100M60 100h80l40 40h140M120 170h70l30-30h160M260 70v-40M300 140v50" />
                <g fill="currentColor">
                  <circle cx="140" cy="40" r="4" /><circle cx="260" cy="70" r="4" /><circle cx="140" cy="100" r="4" />
                  <circle cx="320" cy="140" r="4" /><circle cx="190" cy="170" r="4" /><circle cx="260" cy="30" r="4" />
                </g>
              </svg>
              <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
                <div className="relative shrink-0">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-4 ring-white/90 sm:h-32 sm:w-32">
                    {profile.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.foto_url} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <Icon name="user" className="h-14 w-14 text-white/50" />
                    )}
                  </div>
                  {verified && (
                    <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 ring-2 ring-ink" title={t.verified}>
                      <Icon name="check" className="h-4 w-4" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold sm:text-2xl">{name}</h2>
                  <span className="mt-1 inline-block rounded-full bg-sky-600 px-3 py-0.5 text-xs font-semibold">{badge}</span>
                  {(profile.lokasi || profile.instansi) && (
                    <p className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-white/80 sm:justify-start">
                      {profile.lokasi && <span className="flex items-center gap-1.5"><Icon name="pin" className="h-4 w-4" />{profile.lokasi}</span>}
                      {profile.instansi && <span className="flex items-center gap-1.5"><Icon name="building" className="h-4 w-4" />{profile.instansi}</span>}
                    </p>
                  )}
                  {profile.bio && <p className="mt-3 line-clamp-2 text-sm text-white/85">{profile.bio}</p>}
                  <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <button type="button" onClick={edit} className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold hover:bg-brand-dark">
                      <Icon name="edit" className="h-4 w-4" />
                      {t.editProfile}
                    </button>
                    {publicUrl && (
                      <Link href={publicUrl} className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ring-1 ring-white/60 hover:bg-white/10">
                        <Icon name="external" className="h-4 w-4" />
                        {t.publicProfile}
                      </Link>
                    )}
                  </div>
                </div>

                <div className="hidden shrink-0 flex-col items-center md:flex">
                  <Ring value={percent} dark />
                  <p className="mt-2 text-sm font-semibold">{t.completion}</p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Card title={t.aboutMe} icon="user" action={<EditButton label={t.edit} onClick={edit} />}>
                <p className="text-xs font-semibold text-ink">{t.bio}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{profile.bio || t.noBio}</p>
                <dl className="mt-4 divide-y divide-slate-100 text-sm">
                  {(
                    [
                      ["building", t.company, profile.instansi],
                      ["briefcase", t.job, profile.pekerjaan],
                      ["pin", t.location, profile.lokasi],
                    ] as const
                  ).map(([icon, label, value]) => (
                    <div key={label} className="flex gap-3 py-2.5">
                      <Icon name={icon} className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                      <div>
                        <dt className="text-xs text-slate-500">{label}</dt>
                        <dd className={value ? "text-ink" : "text-slate-400"}>{value || t.empty}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </Card>

              <Card title={t.skills} icon="star" action={<EditButton label={t.edit} onClick={edit} />}>
                <p className="text-xs font-semibold text-brand">{t.technicalSkills}</p>
                {profile.keahlian.length ? (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {profile.keahlian.map((s) => (
                      <li key={s} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-ink">{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm text-slate-400">{t.noSkills}</p>
                )}
              </Card>

              <Card title={t.items.social} icon="link" action={<EditButton label={t.edit} onClick={edit} />}>
                {socials.length ? (
                  <ul className="divide-y divide-slate-100">
                    {socials.map((s) => (
                      <li key={s.key} className="flex items-center gap-3 py-2.5">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${s.color}`}>
                          {s.label.slice(0, 2)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{s.label}</p>
                          <a href={profile[s.key]} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-sky-700 hover:underline">
                            {profile[s.key].replace(/^https?:\/\/(www\.)?/, "")}
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400">{t.noSocial}</p>
                )}
              </Card>
            </div>

            <Card
              title={t.journey}
              subtitle={t.journeySub}
              icon="trophy"
              action={
                !alumni && linkHref ? (
                  <a href={linkHref} target="_blank" rel="noopener noreferrer" className="hidden shrink-0 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark sm:block">
                    {t.linkHistory}
                  </a>
                ) : undefined
              }
            >
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {journey.map((j) => {
                  const body = (
                    <>
                      <Icon name={j.icon} className={`h-6 w-6 shrink-0 ${j.tint}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500">{j.label}</p>
                        <p className="mt-1 text-xl font-extrabold">{j.value}</p>
                        {j.unit && <p className="text-xs text-slate-500">{j.unit}</p>}
                      </div>
                      {j.href && <Icon name="chevron" className="h-4 w-4 shrink-0 self-center text-slate-400" />}
                    </>
                  );
                  const cls = "flex gap-3 rounded-xl p-3 ring-1 ring-slate-200";
                  return j.href ? (
                    <Link key={j.label} href={j.href} className={`${cls} hover:ring-brand/40`}>{body}</Link>
                  ) : (
                    <div key={j.label} className={cls}>{body}</div>
                  );
                })}
              </div>
              {alumni?.results.length ? (
                <ul className="mt-4 divide-y divide-slate-100 text-sm">
                  {[...alumni.results]
                    .sort((a, b) => b.competition.tahun - a.competition.tahun)
                    .map((r) => (
                      <li key={r.competition.id + r.medali} className="flex flex-wrap items-center gap-2 py-2.5">
                        <LevelBadge level={r.competition.level} label={levelShort[r.competition.level]} />
                        <span className="font-semibold">{pick(r.competition, "nama", lang)}</span>
                        <span className="text-slate-500">{r.competition.tahun}</span>
                        <span className="ml-auto font-semibold text-brand">{dict.medals[r.medali]}</span>
                      </li>
                    ))}
                </ul>
              ) : (
                !alumni && (
                  <p className="mt-4 text-xs text-slate-500">
                    {t.linkHint}{" "}
                    {linkHref && (
                      <a href={linkHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline sm:hidden">
                        {t.linkHistory}
                      </a>
                    )}
                  </p>
                )
              )}
            </Card>

            <Card title={t.activity} subtitle={t.activitySub} icon="clock">
              <ul className="divide-y divide-slate-100">
                {activity.map((a) => (
                  <li key={a.title} className="flex items-start gap-3 py-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${a.color}`}>
                      <Icon name={a.icon} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{a.title}</p>
                      <p className="text-xs text-slate-500">{a.text}</p>
                    </div>
                    <time className="shrink-0 text-xs text-slate-500">{fmt.format(new Date(a.at))}</time>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card title={t.completion} icon="grid">
              <div className="flex items-center gap-4">
                <Ring value={percent} />
                <p className="text-sm text-slate-600">{t.completionHint}</p>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm">
                {items.map((i) => (
                  <li key={i.key} className="flex items-center gap-2.5">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        i.state === "done" ? "bg-emerald-500 text-white" : i.state === "partial" ? "bg-sky-500 text-white" : "ring-1 ring-slate-300"
                      }`}
                    >
                      {i.state !== "pending" && <Icon name="check" className="h-3 w-3" />}
                    </span>
                    <span className="flex-1">{t.items[i.key]}</span>
                    <span className={`text-xs font-semibold ${stateStyle[i.state]}`}>{t.state[i.state]}</span>
                  </li>
                ))}
              </ul>
              {percent < 100 && (
                <button type="button" onClick={edit} className="mt-4 w-full rounded-lg bg-slate-100 py-2.5 text-sm font-semibold hover:bg-slate-200">
                  {t.completeProfile} →
                </button>
              )}
            </Card>

            <section className="relative overflow-hidden rounded-2xl bg-ink p-5 text-white">
              <div className="pointer-events-none absolute -right-8 top-0 h-full w-24 skew-x-[-20deg] bg-brand" aria-hidden="true" />
              <div className="pointer-events-none absolute right-12 top-0 h-full w-3 skew-x-[-20deg] bg-brand/60" aria-hidden="true" />
              <div className="relative">
                <p className="text-lg font-extrabold leading-tight">
                  INASKILLS <span className="text-brand">Electronics</span>
                </p>
                <p className="mt-3 text-lg font-bold">{badge}</p>
                <p className="text-xs text-white/70">{t.memberCard}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs">
                  <Icon name="users" className="h-3.5 w-3.5" />
                  {memberSince}
                </span>
              </div>
            </section>

            <div id="keamanan">
              <Card
                title={t.security}
                icon="shield"
                action={
                  verified && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">{t.secure}</span>
                  )
                }
              >
                <ul className="space-y-3 text-sm">
                  <li>
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><Icon name="check" className="h-3 w-3" /></span>
                      <div className="flex-1">
                        <p className="font-medium">{t.password}</p>
                        <p className="text-xs text-slate-500">{t.passwordHint}</p>
                      </div>
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-xs font-semibold text-sky-700 hover:underline">
                        {showPassword ? t.cancel : t.change}
                      </button>
                    </div>
                    {showPassword && (
                      <form onSubmit={savePassword} className="mt-2 flex gap-2 pl-7">
                        <input
                          type="password"
                          minLength={8}
                          required
                          autoFocus
                          placeholder={t.newPassword}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                        <button type="submit" className="rounded-lg bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft">{t.save}</button>
                      </form>
                    )}
                    {status && <p className="mt-1 pl-7 text-xs text-slate-600">{status}</p>}
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${verified ? "bg-emerald-500 text-white" : "ring-1 ring-slate-300"}`}>
                      {verified && <Icon name="check" className="h-3 w-3" />}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{t.emailVerification}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    <span className={`text-xs font-semibold ${verified ? "text-emerald-600" : "text-slate-400"}`}>{verified ? t.verified : t.notVerified}</span>
                  </li>
                  <li className="flex items-start gap-2.5 opacity-60">
                    <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full ring-1 ring-slate-300" />
                    <p className="flex-1 font-medium">{t.twoFactor}</p>
                    <span className="text-xs text-slate-400">{t.notAvailable}</span>
                  </li>
                </ul>
              </Card>
            </div>

            <Card title={t.quickLinks} icon="bolt">
              <ul className="text-sm">
                {admin && (
                  <QuickLink href="/admin/" icon="grid" label={t.toAdmin} />
                )}
                {publicUrl && <QuickLink href={publicUrl} icon="external" label={t.publicProfile} />}
                <QuickLink href={`/${lang}/hall-of-fame/`} icon="crown" label={t.hofPage} />
                <li>
                  <button type="button" onClick={openPassword} className="flex w-full items-center gap-3 py-2 hover:text-brand">
                    <Icon name="lock" className="h-4 w-4 text-slate-500" />
                    <span className="flex-1 text-left">{t.changePassword}</span>
                    <Icon name="chevron" className="h-4 w-4 text-slate-400" />
                  </button>
                </li>
                <li>
                  <button type="button" onClick={logout} className="flex w-full items-center gap-3 py-2 font-semibold text-red-600 hover:underline">
                    <Icon name="logout" className="h-4 w-4" />
                    {dict.nav.logout}
                  </button>
                </li>
              </ul>
            </Card>
          </aside>
        </div>
      </div>

      {editing && (
        <ProfileEditor
          profile={profile}
          userId={user.id}
          email={user.email ?? ""}
          onChange={(p) => setProfile((cur) => ({ ...cur, ...p }))}
          onClose={closeEditor}
        />
      )}
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: IconName; label: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 py-2 hover:text-brand">
        <Icon name={icon} className="h-4 w-4 text-slate-500" />
        <span className="flex-1">{label}</span>
        <Icon name="chevron" className="h-4 w-4 text-slate-400" />
      </Link>
    </li>
  );
}
