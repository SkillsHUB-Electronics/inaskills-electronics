"use client";

import { useEffect, useState } from "react";
import { inputClass } from "@/components/admin/CrudManager";
import { list, upsertContent } from "@/lib/mutations";
import { socialPlatforms } from "@/lib/social";

type Item = { key: string; label: string; bilingual: boolean; multiline?: boolean; hint?: string };

const groups: { title: string; items: Item[] }[] = [
  {
    title: "Hero (bagian atas Beranda)",
    items: [
      { key: "hero_title", label: "Judul", bilingual: true, hint: "Kosongkan untuk memakai teks bawaan." },
      { key: "hero_subtitle", label: "Subjudul", bilingual: true, multiline: true },
    ],
  },
  {
    title: "Statistik",
    items: [
      { key: "stats_medals", label: "Jumlah medali", bilingual: false },
      { key: "stats_competitions", label: "Jumlah kompetisi", bilingual: false },
      { key: "stats_alumni", label: "Jumlah alumni juara", bilingual: false },
      { key: "stats_countries", label: "Negara dikunjungi", bilingual: false },
    ],
  },
  {
    title: "Kontak",
    items: [
      { key: "contact_whatsapp", label: "Nomor WhatsApp", bilingual: false, hint: "Format internasional tanpa + atau spasi, mis. 6281234567890." },
      { key: "contact_email", label: "Email", bilingual: false },
    ],
  },
  {
    title: "Media sosial (link lengkap, kosongkan bila tidak ada)",
    items: socialPlatforms.map((p) => ({ key: p.key, label: p.label, bilingual: false })),
  },
];

type Values = Record<string, { value_id: string; value_en: string }>;

export default function AdminContentPage() {
  const [values, setValues] = useState<Values>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    list("site_content", "key")
      .then((rows) => setValues(Object.fromEntries(rows.map((r) => [r.key, { value_id: String(r.value_id ?? ""), value_en: String(r.value_en ?? "") }]))))
      .catch((e) => setStatus(`Gagal memuat: ${e.message}`));
  }, []);

  const get = (key: string, lang: "value_id" | "value_en") => values[key]?.[lang] ?? "";
  const set = (key: string, lang: "value_id" | "value_en", v: string) =>
    setValues((all) => {
      const current = all[key] ?? { value_id: "", value_en: "" };
      // Nilai satu bahasa (angka, kontak) disalin ke kedua kolom.
      return { ...all, [key]: lang === "value_id" && !isBilingual(key) ? { value_id: v, value_en: v } : { ...current, [lang]: v } };
    });

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Menyimpan...");
    try {
      const rows = groups.flatMap((g) => g.items).map((i) => ({ key: i.key, value_id: get(i.key, "value_id"), value_en: get(i.key, "value_en") }));
      await upsertContent(rows);
      setStatus("Tersimpan.");
    } catch (err) {
      setStatus(`Gagal menyimpan: ${(err as Error).message}`);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-6">
      <h1 className="text-2xl font-bold">Konten & Kontak</h1>
      {groups.map((g) => (
        <section key={g.title} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-6">
          <h2 className="font-bold">{g.title}</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {g.items.map((i) =>
              i.bilingual ? (
                (["value_id", "value_en"] as const).map((lang) => (
                  <label key={i.key + lang} className="block text-sm font-medium">
                    {i.label} ({lang === "value_id" ? "Indonesia" : "English"})
                    {i.multiline ? (
                      <textarea rows={3} value={get(i.key, lang)} onChange={(e) => set(i.key, lang, e.target.value)} className={inputClass} />
                    ) : (
                      <input value={get(i.key, lang)} onChange={(e) => set(i.key, lang, e.target.value)} className={inputClass} />
                    )}
                    {i.hint && lang === "value_id" && <span className="mt-1 block text-xs font-normal text-slate-500">{i.hint}</span>}
                  </label>
                ))
              ) : (
                <label key={i.key} className="block text-sm font-medium">
                  {i.label}
                  <input value={get(i.key, "value_id")} onChange={(e) => set(i.key, "value_id", e.target.value)} className={inputClass} />
                  {i.hint && <span className="mt-1 block text-xs font-normal text-slate-500">{i.hint}</span>}
                </label>
              ),
            )}
          </div>
        </section>
      ))}
      <div className="flex items-center gap-4">
        <button type="submit" className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-dark">
          Simpan semua
        </button>
        {status && <span className="text-sm text-slate-600">{status}</span>}
      </div>
    </form>
  );
}

function isBilingual(key: string) {
  return groups.some((g) => g.items.some((i) => i.key === key && i.bilingual));
}
