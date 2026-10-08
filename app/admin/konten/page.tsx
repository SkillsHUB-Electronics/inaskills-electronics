"use client";

import { useEffect, useState } from "react";
import { inputClass } from "@/components/admin/CrudManager";
import { list, upsertContent } from "@/lib/mutations";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { socialPlatforms } from "@/lib/social";

type Item = { key: string; label: string; bilingual: boolean; multiline?: boolean; hint?: string; fallback?: (d: Dictionary) => string };

const id = getDictionary("id");
const en = getDictionary("en");

// Teks halaman: kosongkan untuk memakai teks bawaan (tampil sebagai placeholder).
const text = (key: string, label: string, fallback: (d: Dictionary) => string, multiline = false): Item => ({
  key,
  label,
  bilingual: true,
  multiline,
  fallback,
});

const groups: { title: string; items: Item[] }[] = [
  {
    title: "Hero (bagian atas Beranda)",
    items: [
      text("hero_eyebrow", "Label kecil di atas judul", (d) => d.hero.eyebrow),
      text("hero_title", "Judul", (d) => d.hero.title),
      text("hero_subtitle", "Subjudul", (d) => d.hero.subtitle, true),
      text("hero_cta_primary", "Tombol utama", (d) => d.hero.ctaPrimary),
      text("hero_cta_secondary", "Tombol kedua", (d) => d.hero.ctaSecondary),
    ],
  },
  {
    title: "Tentang Kami (Beranda)",
    items: [
      text("about_title", "Judul", (d) => d.about.title),
      text("about_text", "Isi (baris kosong = paragraf baru)", (d) => d.about.text, true),
    ],
  },
  {
    title: "Ajakan Sponsor (bagian merah di bawah Beranda)",
    items: [
      text("cta_title", "Judul", (d) => d.cta.title),
      text("cta_subtitle", "Subjudul", (d) => d.cta.subtitle, true),
      text("cta_button", "Tombol", (d) => d.cta.button),
    ],
  },
  {
    title: "Halaman Jadi Sponsor",
    items: [
      text("sponsor_title", "Judul", (d) => d.sponsorPage.title),
      text("sponsor_subtitle", "Subjudul", (d) => d.sponsorPage.subtitle, true),
      text("sponsor_why_title", "Judul alasan", (d) => d.sponsorPage.whyTitle),
      ...[0, 1, 2].map((i) => text(`sponsor_why_${i + 1}`, `Alasan ${i + 1}`, (d) => d.sponsorPage.why[i], true)),
    ],
  },
  {
    title: "Footer",
    items: [
      text("footer_tagline", "Kalimat di bawah logo", (d) => d.hero.eyebrow, true),
      text("footer_rights", "Teks hak cipta", (d) => d.footer.rights),
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
      <div>
        <h1 className="text-2xl font-bold">Konten & Kontak</h1>
        <p className="mt-1 text-sm text-slate-500">Teks abu-abu di kolom adalah teks bawaan. Kosongkan kolom untuk tetap memakai teks bawaan.</p>
      </div>
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
                      <textarea rows={4} placeholder={i.fallback?.(lang === "value_id" ? id : en)} value={get(i.key, lang)} onChange={(e) => set(i.key, lang, e.target.value)} className={inputClass} />
                    ) : (
                      <input placeholder={i.fallback?.(lang === "value_id" ? id : en)} value={get(i.key, lang)} onChange={(e) => set(i.key, lang, e.target.value)} className={inputClass} />
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
