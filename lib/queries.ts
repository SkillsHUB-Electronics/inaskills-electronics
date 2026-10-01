import { supabase } from "@/lib/supabase";
import { sample } from "@/lib/sample-data";
import type { Competition, HallOfFameEntry, Sponsor } from "@/types/database";

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

export async function getSiteContent(): Promise<Record<string, { value_id: string; value_en: string }>> {
  if (!supabase) return {};
  const { data, error } = await supabase.from("site_content").select("*");
  if (error) throw error;
  return Object.fromEntries(data.map((row) => [row.key, row]));
}
