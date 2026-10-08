import { hofMedals } from "@/lib/levels";
import type { Competition, Result } from "@/types/database";

export const emptyProfile = {
  nama: "",
  foto_url: "",
  bio: "",
  pekerjaan: "",
  instansi: "",
  lokasi: "",
  quote_id: "",
  quote_en: "",
  telepon: "",
  email_publik: false,
  telepon_publik: false,
  linkedin_url: "",
  github_url: "",
  instagram_url: "",
  keahlian: [] as string[],
};
export type Profile = typeof emptyProfile & { created_at?: string; updated_at?: string };

export const socialFields = [
  { key: "linkedin_url", label: "LinkedIn", placeholder: "https://linkedin.com/in/...", color: "bg-[#0a66c2]" },
  { key: "github_url", label: "GitHub", placeholder: "https://github.com/...", color: "bg-[#181717]" },
  { key: "instagram_url", label: "Instagram", placeholder: "https://instagram.com/...", color: "bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af]" },
] as const;

// Baris profil dari database -> nilai form (null jadi string kosong).
export function toProfile(row: Record<string, unknown> | null): Profile {
  const r = row ?? {};
  const p = Object.fromEntries(
    Object.keys(emptyProfile).map((k) => [k, k === "keahlian" ? (Array.isArray(r[k]) ? r[k] : []) : typeof emptyProfile[k as keyof typeof emptyProfile] === "boolean" ? Boolean(r[k]) : ((r[k] as string | null) ?? "")]),
  ) as Profile;
  return { ...p, created_at: r.created_at as string | undefined, updated_at: r.updated_at as string | undefined };
}

export type JourneyResult = Pick<Result, "medali"> & { competition: Pick<Competition, "id" | "nama_id" | "nama_en" | "tahun" | "level"> };
export interface LinkedAlumni {
  slug: string;
  results: JourneyResult[];
}

export type ItemState = "done" | "partial" | "pending";

// Butir kelengkapan profil; "sebagian" dihitung setengah.
export function completion(p: Profile, alumni: LinkedAlumni | null) {
  const state = (filled: number, total: number): ItemState => (filled === total ? "done" : filled > 0 ? "partial" : "pending");
  const count = (...v: string[]) => v.filter((x) => x.trim()).length;
  const items = [
    { key: "basic", state: state(count(p.nama, p.pekerjaan, p.instansi, p.lokasi), 4) },
    { key: "about", state: state(count(p.bio), 1) },
    { key: "skills", state: state(Math.min(p.keahlian.length, 1), 1) },
    { key: "social", state: state(count(p.linkedin_url, p.github_url, p.instagram_url), 3) },
    { key: "history", state: state(alumni?.results.length ? 1 : 0, 1) },
    { key: "photo", state: state(count(p.foto_url), 1) },
  ] as const;
  const score = items.reduce((s, i) => s + (i.state === "done" ? 1 : i.state === "partial" ? 0.5 : 0), 0);
  return { items, percent: Math.round((score / items.length) * 100) };
}

export function journeyStats(results: JourneyResult[]) {
  return {
    competitions: new Set(results.map((r) => r.competition.id)).size,
    medals: results.filter((r) => ["gold", "silver", "bronze"].includes(r.medali)).length,
    hof: results.filter((r) => (hofMedals as readonly string[]).includes(r.medali)).length,
    since: results.length ? Math.min(...results.map((r) => r.competition.tahun)) : null,
  };
}
