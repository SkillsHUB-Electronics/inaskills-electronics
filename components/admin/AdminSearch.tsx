"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAdminLang } from "@/lib/adminLang";
import AdminIcon, { type IconName } from "./AdminIcon";
import { adminMenu } from "./adminMenu";

type Hit = { key: string; label: string; sub: string; href: string; icon: IconName };

// Sumber pencarian: tabel -> kolom nama dan halaman admin tujuannya.
const sources = [
  { table: "alumni", column: "nama", href: "/admin/alumni/", icon: "alumni", menu: "alumni" },
  { table: "competitions", column: "nama_id", href: "/admin/kompetisi/", icon: "kompetisi", menu: "kompetisi" },
  { table: "news", column: "judul_id", href: "/admin/berita/", icon: "berita", menu: "berita" },
  { table: "projects", column: "judul_id", href: "/admin/proyek/", icon: "proyek", menu: "proyek" },
  { table: "sponsors", column: "nama", href: "/admin/sponsor/", icon: "sponsor", menu: "sponsor" },
] as const;

export default function AdminSearch({ className = "" }: { className?: string }) {
  const { t } = useAdminLang();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    // Jeda singkat agar tidak query di setiap ketukan.
    const timer = setTimeout(async () => {
      const menuHits: Hit[] = adminMenu
        .filter((m) => t.menu[m.key].toLowerCase().includes(q.toLowerCase()))
        .map((m) => ({ key: `menu-${m.key}`, label: t.menu[m.key], sub: "Menu", href: m.href, icon: m.icon }));
      const pattern = `%${q.replace(/[%_,()]/g, " ")}%`;
      const results = supabase
        ? await Promise.all(
            sources.map(async (s) => {
              const { data } = await supabase!.from(s.table).select(`id, ${s.column}`).ilike(s.column, pattern).limit(4);
              return ((data ?? []) as unknown as Record<string, string>[]).map((r) => ({
                key: `${s.table}-${r.id}`,
                label: r[s.column],
                sub: t.menu[s.menu],
                href: s.href,
                icon: s.icon as IconName,
              }));
            }),
          )
        : [];
      setHits([...menuHits, ...results.flat()].slice(0, 10));
    }, 250);
    return () => clearTimeout(timer);
  }, [query, t]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const showResults = open && query.trim().length >= 2;

  return (
    <div ref={box} className={`relative ${className}`}>
      <AdminIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        placeholder={t.search}
        aria-label={t.search}
        className="h-10 w-full rounded-xl bg-white/10 pl-9 pr-3 text-sm text-white placeholder:text-white/50 outline-none ring-1 ring-white/10 focus:ring-blue-400"
      />
      {showResults && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl bg-white text-ink shadow-xl ring-1 ring-slate-200">
          {hits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">{t.searchEmpty}</p>
          ) : (
            hits.map((h) => (
              <Link
                key={h.key}
                href={h.href}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50"
              >
                <AdminIcon name={h.icon} className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{h.label}</span>
                <span className="shrink-0 text-xs text-slate-400">{h.sub}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
