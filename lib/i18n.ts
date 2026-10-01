import id from "@/dictionaries/id.json";
import en from "@/dictionaries/en.json";

export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "id";

const dictionaries = { id, en };
export type Dictionary = typeof id;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDictionary(locale: string): Dictionary {
  return dictionaries[isLocale(locale) ? locale : defaultLocale];
}

// Pilih field bilingual dari baris database, mis. pick(row, "bio", "en") -> row.bio_en
export function pick(row: object, field: string, locale: Locale): string {
  const r = row as Record<string, unknown>;
  const value = r[`${field}_${locale}`] || r[`${field}_${defaultLocale}`];
  return typeof value === "string" ? value : "";
}
