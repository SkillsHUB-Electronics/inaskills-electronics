"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const cards = [
  { table: "alumni", label: "Alumni", href: "/admin/alumni/" },
  { table: "competitions", label: "Kompetisi", href: "/admin/kompetisi/" },
  { table: "sponsors", label: "Sponsor", href: "/admin/sponsor/" },
  { table: "contact_messages", label: "Pesan masuk", href: "/admin/pesan/" },
] as const;

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number | null>>({});

  useEffect(() => {
    if (!supabase) return;
    for (const c of cards) {
      supabase
        .from(c.table)
        .select("*", { count: "exact", head: true })
        .then(({ count }) => setCounts((all) => ({ ...all, [c.table]: count })));
    }
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.table} href={c.href} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 hover:shadow-md">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-brand">{counts[c.table] ?? "–"}</p>
          </Link>
        ))}
      </div>
      <Link href="/id/" target="_blank" className="mt-8 inline-block font-semibold text-ink hover:text-brand">
        Lihat situs →
      </Link>
    </div>
  );
}
