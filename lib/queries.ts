import { supabase } from "@/lib/supabase";
import { sample } from "@/lib/sample-data";
import type { Alumni, Competition, CompetitionImage, HallOfFameEntry, News, Project, Result, Sponsor } from "@/types/database";

export async function getLatestCompetitions(limit = 3): Promise<Competition[]> {
  if (!supabase) return sample.competitions.slice(0, limit);
  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .order("tahun", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getHallOfFame(limit?: number): Promise<HallOfFameEntry[]> {
  if (!supabase) return limit ? sample.hallOfFame.slice(0, limit) : sample.hallOfFame;
  let query = supabase
    .from("results")
    .select("*, alumni(*), competition:competitions(*)")
    .in("medali", ["gold", "silver", "bronze", "moe"])
    .order("competition(tahun)", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data as HallOfFameEntry[];
}

export async function getSponsors(): Promise<Sponsor[]> {
  if (!supabase) return sample.sponsors;
  const { data, error } = await supabase
    .from("sponsors")
    .select("*")
    .eq("aktif", true)
    .order("urutan");
  if (error) throw error;
  return data;
}

type SiteContent = Record<string, { value_id: string; value_en: string }>;
let siteContentRequest: Promise<SiteContent> | null = null;

// Dipakai beberapa komponen sekaligus (Hero, statistik, kontak), jadi cukup satu request per halaman.
export function getSiteContent(): Promise<SiteContent> {
  if (!supabase) return Promise.resolve({});
  siteContentRequest ??= (async () => {
    const { data, error } = await supabase.from("site_content").select("*");
    if (error) {
      siteContentRequest = null;
      throw error;
    }
    return Object.fromEntries(data.map((row) => [row.key, row]));
  })();
  return siteContentRequest;
}

export async function getAllCompetitions(): Promise<Competition[]> {
  if (!supabase) return sample.competitions;
  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .order("tahun", { ascending: false });
  if (error) throw error;
  return data;
}

export interface CompetitionDetail {
  competition: Competition;
  results: (Result & { alumni: Alumni })[];
  images: CompetitionImage[];
}

export async function getCompetitionBySlug(slug: string): Promise<CompetitionDetail | null> {
  if (!supabase) {
    const competition = sample.competitions.find((c) => c.slug === slug);
    if (!competition) return null;
    const results = sample.hallOfFame.filter((r) => r.competition_id === competition.id);
    return { competition, results, images: [] };
  }
  const { data: competition, error } = await supabase
    .from("competitions")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!competition) return null;
  const [results, images] = await Promise.all([
    supabase.from("results").select("*, alumni(*)").eq("competition_id", competition.id).order("peringkat"),
    supabase.from("competition_images").select("*").eq("competition_id", competition.id).order("urutan"),
  ]);
  if (results.error) throw results.error;
  if (images.error) throw images.error;
  return { competition, results: results.data, images: images.data };
}

export interface AlumniDetail {
  alumni: Alumni;
  results: (Result & { competition: Competition })[];
}

export async function getAlumniBySlug(slug: string): Promise<AlumniDetail | null> {
  if (!supabase) {
    const entries = sample.hallOfFame.filter((r) => r.alumni.slug === slug);
    if (entries.length === 0) return null;
    return { alumni: entries[0].alumni, results: entries };
  }
  const { data: alumni, error } = await supabase.from("alumni").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!alumni) return null;
  const results = await supabase
    .from("results")
    .select("*, competition:competitions(*)")
    .eq("alumni_id", alumni.id);
  if (results.error) throw results.error;
  return { alumni, results: results.data };
}

export async function sendContactMessage(msg: {
  nama: string;
  perusahaan: string;
  email: string;
  telepon: string;
  pesan: string;
}): Promise<void> {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  const { error } = await supabase.from("contact_messages").insert(msg);
  if (error) throw error;
}

export async function getProjects(): Promise<Project[]> {
  if (!supabase) return sample.projects;
  const { data, error } = await supabase
    .from("projects")
    .select("*, alumni(nama, slug)")
    .order("urutan")
    .order("tahun", { ascending: false });
  if (error) throw error;
  return data as Project[];
}

export async function getNews(limit?: number): Promise<News[]> {
  if (!supabase) return limit ? sample.news.slice(0, limit) : sample.news;
  let q = supabase.from("news").select("*").eq("terbit", true).order("tanggal", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  if (!supabase) return sample.news.find((n) => n.slug === slug) ?? null;
  const { data, error } = await supabase.from("news").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export interface Highlight {
  competition: Competition;
  medals: Record<"gold" | "silver" | "bronze" | "moe", number>;
}

// Kompetisi terbaru beserta rekap medalinya, untuk kartu Sorotan di Beranda.
export async function getHighlight(): Promise<Highlight | null> {
  const [competition] = await getLatestCompetitions(1);
  if (!competition) return null;
  const results = supabase
    ? (await supabase.from("results").select("medali").eq("competition_id", competition.id)).data ?? []
    : sample.hallOfFame.filter((r) => r.competition_id === competition.id);
  const medals = { gold: 0, silver: 0, bronze: 0, moe: 0 };
  for (const r of results) if (r.medali in medals) medals[r.medali as keyof typeof medals]++;
  return { competition, medals };
}
