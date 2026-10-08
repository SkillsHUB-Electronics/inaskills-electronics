"use client";

import Section from "@/components/ui/Section";
import type { Dictionary, Locale } from "@/lib/i18n";
import { useSiteText } from "@/lib/useSiteText";

// Bagian atas halaman Sponsor; semua teks bisa diubah dari admin Konten & Kontak.
export default function SponsorIntro({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const text = useSiteText(lang);
  const t = dict.sponsorPage;

  return (
    <>
      <header className="bg-ink px-4 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h1 className="max-w-3xl text-3xl font-extrabold sm:text-4xl">{text("sponsor_title", t.title)}</h1>
          <p className="mt-3 max-w-2xl text-white/80">{text("sponsor_subtitle", t.subtitle)}</p>
        </div>
      </header>

      <Section title={text("sponsor_why_title", t.whyTitle)}>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {t.why.map((w, i) => (
            <li key={i} className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <span className="text-2xl font-extrabold text-brand">0{i + 1}</span>
              <p className="mt-2 text-slate-700">{text(`sponsor_why_${i + 1}`, w)}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
