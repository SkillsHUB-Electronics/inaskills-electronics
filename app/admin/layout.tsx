"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AdminIcon from "@/components/admin/AdminIcon";
import AdminSearch from "@/components/admin/AdminSearch";
import { adminMenu } from "@/components/admin/adminMenu";
import { isAdmin, signOut } from "@/lib/auth";
import { countUnreadMessages } from "@/lib/adminInbox";
import { AdminLangProvider, useAdminLang } from "@/lib/adminLang";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/useSession";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLangProvider>
      <AdminShell>{children}</AdminShell>
    </AdminLangProvider>
  );
}

function Logo() {
  return (
    <Link href="/admin/" className="flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path className="text-white" d="M8 30 18 20l6 6 8-12M18 20l-4-10M24 26h8" />
        <circle className="text-white" cx="8" cy="30" r="3" fill="currentColor" />
        <circle className="text-white" cx="14" cy="10" r="3" fill="currentColor" />
        <circle className="text-brand" cx="18" cy="20" r="3.2" fill="currentColor" stroke="none" />
        <circle className="text-white" cx="32" cy="14" r="3" fill="currentColor" />
        <circle className="text-white" cx="32" cy="26" r="3" fill="currentColor" />
      </svg>
      <span className="leading-none">
        <span className="block text-lg font-extrabold tracking-wide text-white">INASKILLS</span>
        <span className="block text-sm font-semibold text-brand">Electronics</span>
      </span>
    </Link>
  );
}

function Avatar({ name, src, size = "h-10 w-10" }: { name: string; src: string | null; size?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`${size} shrink-0 rounded-full object-cover ring-2 ring-white/20`} />
  ) : (
    <span className={`${size} grid shrink-0 place-items-center rounded-full bg-white text-sm font-bold text-ink`}>{initials || "A"}</span>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading } = useSession();
  const { lang, t, setLang } = useAdminLang();
  const [open, setOpen] = useState(false);
  // null = belum dicek. User biasa yang membuka /admin diarahkan ke halaman akunnya.
  const [admin, setAdmin] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<{ nama: string; foto_url: string | null } | null>(null);
  const [unread, setUnread] = useState(0);
  const isLogin = pathname.startsWith("/admin/login");

  useEffect(() => {
    if (isLogin || loading) return;
    if (!session) {
      router.replace("/id/login/");
      return;
    }
    isAdmin().then((ok) => {
      setAdmin(ok);
      if (!ok) router.replace("/id/akun/");
    });
    supabase
      ?.from("profiles")
      .select("nama, foto_url")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [isLogin, loading, session, router]);

  // Hitung ulang badge pesan setiap pindah halaman (halaman Pesan Masuk menandai semua terbaca).
  useEffect(() => {
    if (admin) countUnreadMessages().then(setUnread);
  }, [admin, pathname]);

  if (isLogin) return <>{children}</>;

  if (loading || !session || !admin) return <p className="p-8 text-slate-500">{t.loading}</p>;

  async function logout() {
    await signOut();
    router.replace("/id/login/");
  }

  const name = profile?.nama || session.user.email?.split("@")[0] || "Admin";
  const isActive = (href: string) => pathname === href || pathname === href.slice(0, -1);

  const menuLink = (m: (typeof adminMenu)[number]) => (
    <Link
      key={m.href}
      href={m.href}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
        isActive(m.href) ? "bg-blue-600 font-semibold text-white shadow-lg shadow-blue-900/40" : "text-white/75 hover:bg-white/5 hover:text-white"
      }`}
    >
      <AdminIcon name={m.icon} className="h-5 w-5 shrink-0" />
      <span className="flex-1">{t.menu[m.key]}</span>
      {m.key === "pesan" && unread > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-xs font-bold text-white">{unread}</span>
      )}
    </Link>
  );

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-2 pb-6 pt-1">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {adminMenu.filter((m) => m.group === "manage").map(menuLink)}
        <p className="px-3 pb-2 pt-5 text-xs font-semibold uppercase tracking-wider text-white/40">{t.groupSystem}</p>
        {adminMenu.filter((m) => m.group === "system").map(menuLink)}
        <Link href="/id/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/5 hover:text-white">
          <AdminIcon name="external" className="h-5 w-5 shrink-0" />
          {t.viewSite}
        </Link>
      </nav>
      <div className="mt-4 flex items-center gap-3 border-t border-white/10 px-2 pt-4">
        <Avatar name={name} src={profile?.foto_url ?? null} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="truncate text-xs text-white/50">{t.administrator}</p>
        </div>
        <button type="button" onClick={logout} aria-label={t.logout} title={t.logout} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white">
          <AdminIcon name="logout" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 md:pl-64">
      {/* Desktop: sidebar tetap. HP: drawer dari kiri. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink p-4 md:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-72 max-w-[85%] bg-ink p-4">{sidebar}</aside>
        </div>
      )}

      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-ink px-4 text-white sm:px-6">
        <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(true)} className="-ml-1 rounded-lg p-2 hover:bg-white/10 md:hidden">
          <AdminIcon name="menu" />
        </button>
        <AdminSearch className="hidden max-w-md flex-1 sm:block" />
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link href="/admin/pesan/" aria-label={`${unread} ${t.newMessages}`} title={`${unread} ${t.newMessages}`} className="relative rounded-lg p-2 hover:bg-white/10">
            <AdminIcon name="bell" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold">{unread}</span>
            )}
          </Link>
          <div className="flex rounded-lg bg-white/10 p-0.5 text-xs font-semibold" role="group" aria-label="Bahasa / Language">
            {(["id", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-md px-2.5 py-1.5 uppercase ${lang === l ? "bg-white text-ink" : "text-white/70 hover:text-white"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <Link href="/admin/akun/" className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 hover:bg-white/10">
            <Avatar name={name} src={profile?.foto_url ?? null} size="h-9 w-9" />
            <span className="hidden leading-tight lg:block">
              <span className="block max-w-40 truncate text-sm font-semibold">{name}</span>
              <span className="block text-xs text-white/50">{t.administrator}</span>
            </span>
          </Link>
        </div>
      </header>
      <div className="bg-ink px-4 pb-3 sm:hidden">
        <AdminSearch />
      </div>

      <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
