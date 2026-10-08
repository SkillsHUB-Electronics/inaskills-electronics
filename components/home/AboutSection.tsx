"use client";

import type { Dictionary, Locale } from "@/lib/i18n";
import { useSiteText } from "@/lib/useSiteText";

export default function AboutSection({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const text = useSiteText(lang);

  return (
    <section id="tentang" className="px-4 py-14 sm:py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-10">
        <div>
          <span className="block h-1 w-12 rounded-full bg-brand" />
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{text("about_title", dict.about.title)}</h2>
        </div>
        <p className="whitespace-pre-line text-slate-700 md:col-span-2 md:text-lg">{text("about_text", dict.about.text)}</p>
      </div>
    </section>
  );
}
