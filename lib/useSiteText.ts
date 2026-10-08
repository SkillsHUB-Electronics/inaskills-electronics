"use client";

import type { Locale } from "@/lib/i18n";
import { getSiteContent } from "@/lib/queries";
import { useQuery } from "@/lib/useQuery";

// Teks dari admin (Konten & Kontak) menggantikan teks bawaan bila diisi.
export function useSiteText(lang: Locale) {
  const { data } = useQuery(getSiteContent, {});
  const field = lang === "en" ? "value_en" : "value_id";
  return (key: string, fallback: string) => data[key]?.[field]?.trim() || fallback;
}
