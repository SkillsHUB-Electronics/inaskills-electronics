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
  linkedin_url?: string | null;
  github_url?: string | null;
  instagram_url?: string | null;
  pekerjaan?: string | null;
  instansi?: string | null;
  lokasi?: string | null;
  keahlian?: string[] | null;
  quote_id?: string | null;
  quote_en?: string | null;
  kontak_email?: string | null;
  kontak_telepon?: string | null;
}

export interface Competition {
  id: string;
  slug: string;
  nama_id: string;
  nama_en: string;
  level: Level;
  tahun: number;
  kota: string | null;
  negara: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  website_url: string | null;
  logo_url?: string | null;
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
  catatan_en?: string | null;
  foto_url?: string | null;
  best_of_nation?: boolean;
  albert_vidal?: boolean;
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

export type ProjectCategory = "rnd" | "soal" | "task_project" | "lainnya";

export interface Project {
  id: string;
  slug: string;
  judul_id: string;
  judul_en: string;
  deskripsi_id: string;
  deskripsi_en: string;
  kategori: ProjectCategory;
  status: "published" | "under_development";
  tahun: number | null;
  alumni_id: string | null;
  cover_url: string | null;
  repo_url: string | null;
  demo_url: string | null;
  file_url: string | null;
  urutan: number;
  alumni?: Pick<Alumni, "nama" | "slug"> | null;
}

export interface News {
  id: string;
  slug: string;
  judul_id: string;
  judul_en: string;
  ringkasan_id: string;
  ringkasan_en: string;
  isi_id: string;
  isi_en: string;
  cover_url: string | null;
  tanggal: string;
  terbit: boolean;
}
