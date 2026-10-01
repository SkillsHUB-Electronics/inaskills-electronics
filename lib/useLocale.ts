"use client";

import { useParams } from "next/navigation";
import { defaultLocale, getDictionary, isLocale, type Locale } from "@/lib/i18n";

export function useLocale(): { lang: Locale; dict: ReturnType<typeof getDictionary> } {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang && isLocale(params.lang) ? params.lang : defaultLocale;
  return { lang, dict: getDictionary(lang) };
}
