import type { Locale } from "@/lib/i18n";
import type { Competition } from "@/types/database";

// "Shanghai, China"
export function place(c: Pick<Competition, "kota" | "negara">): string {
  return [c.kota, c.negara].filter(Boolean).join(", ");
}

// "22–27 Sep 2026", "30 Agu – 2 Sep 2026", atau satu tanggal bila tanggal selesai kosong.
export function dateRange(c: Pick<Competition, "tanggal_mulai" | "tanggal_selesai">, lang: Locale): string {
  if (!c.tanggal_mulai) return "";
  const locale = lang === "id" ? "id-ID" : "en-GB";
  const fmt = (d: string, o: Intl.DateTimeFormatOptions) => new Date(`${d}T00:00:00`).toLocaleDateString(locale, o);
  const full: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const end = c.tanggal_selesai;
  if (!end || end === c.tanggal_mulai) return fmt(c.tanggal_mulai, full);
  const [y1, m1] = c.tanggal_mulai.split("-");
  const [y2, m2] = end.split("-");
  if (y1 !== y2) return `${fmt(c.tanggal_mulai, full)} – ${fmt(end, full)}`;
  if (m1 !== m2) return `${fmt(c.tanggal_mulai, { day: "numeric", month: "short" })} – ${fmt(end, full)}`;
  return `${fmt(c.tanggal_mulai, { day: "numeric" })}–${fmt(end, full)}`;
}
