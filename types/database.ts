import type { Level } from "@/lib/levels";

export type Medal = "gold" | "silver" | "bronze" | "moe" | "peserta";

export interface Alumni {
  id: string;
  slug: string;
  nama: string;
  foto_url: string | null;
  bio_id: string;
  bio_en: string;
  asal_daerah: string | null;
  tahun_aktif: string | null;
  unggulan: boolean;
}

export interface Competition {
  id: string;
  slug: string;
  nama_id: string;
  nama_en: string;
  level: Level;
  tahun: number;
  lokasi: string | null;
  tanggal: string | null;
  overview_id: string;
  overview_en: string;
  cover_url: string | null;
}

export interface Result {
  id: string;
  competition_id: string;
  alumni_id: string;
  medali: Medal;
  peringkat: number | null;
  catatan: string | null;
}

export interface Sponsor {
  id: string;
  nama: string;
  logo_url: string;
  website: string | null;
  tier: string | null;
  urutan: number;
  aktif: boolean;
}

export interface HallOfFameEntry extends Result {
  alumni: Alumni;
  competition: Competition;
}

export interface CompetitionImage {
  id: string;
  competition_id: string;
  url: string;
  caption_id: string;
  caption_en: string;
  urutan: number;
}
