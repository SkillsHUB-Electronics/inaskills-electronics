"use client";

import type { Locale } from "@/lib/i18n";
import { useSiteText } from "@/lib/useSiteText";

// Pulau kecil untuk komponen server: tampilkan teks bawaan, lalu ganti dengan isian admin.
export default function SiteText({ k, lang, fallback }: { k: string; lang: Locale; fallback: string }) {
  const text = useSiteText(lang);
  return <>{text(k, fallback)}</>;
}
