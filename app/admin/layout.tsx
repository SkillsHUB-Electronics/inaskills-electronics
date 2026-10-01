"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAdmin, signOut } from "@/lib/auth";
import { useSession } from "@/lib/useSession";

const menu = [
  { href: "/admin/", label: "Dashboard" },
  { href: "/admin/alumni/", label: "Alumni" },
  { href: "/admin/kompetisi/", label: "Kompetisi" },
  { href: "/admin/proyek/", label: "Proyek & Riset" },
  { href: "/admin/berita/", label: "Berita" },
  { href: "/admin/sponsor/", label: "Sponsor" },
  { href: "/admin/konten/", label: "Konten & Kontak" },
  { href: "/admin/pesan/", label: "Pesan Masuk" },
  { href: "/admin/akun/", label: "Akun" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading } = useSession();
  const [open, setOpen] = useState(false);
  // null = belum dicek. User biasa yang membuka /admin diarahkan ke halaman akunnya.
  const [admin, setAdmin] = useState<boolean | null>(null);
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
  }, [isLogin, loading, session, router]);

  if (isLogin) return <>{children}</>;

  if (loading || !session || !admin) return <p className="p-8 text-slate-500">Memuat...</p>;

  async function logout() {
    await signOut();
    router.replace("/id/login/");
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {menu.map((m) => (
        <Link
          key={m.href}
          href={m.href}
          onClick={() => setOpen(false)}
          className={`rounded-lg px-3 py-2 text-sm ${
            pathname === m.href || pathname === m.href.slice(0, -1) ? "bg-white/10 font-semibold text-white" : "text-white/70 hover:text-white"
          }`}
        >
          {m.label}
        </Link>
      ))}
      <button type="button" onClick={logout} className="mt-4 rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:text-white">
        Keluar
      </button>
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      {/* HP: bar atas + drawer. Desktop: sidebar tetap. */}
      <header className="flex h-14 items-center justify-between bg-ink px-4 text-white md:hidden">
        <span className="font-bold">Admin Inaskills</span>
        <button type="button" aria-label="Menu" onClick={() => setOpen((v) => !v)} className="p-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </header>
      {open && <div className="bg-ink px-4 pb-4 md:hidden">{nav}</div>}

      <aside className="hidden w-60 shrink-0 bg-ink p-4 md:block">
        <p className="mb-6 px-3 font-bold text-white">
          Admin <span className="text-brand">Inaskills</span>
        </p>
        {nav}
        <p className="mt-6 truncate px-3 text-xs text-white/40">{session.user.email}</p>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
