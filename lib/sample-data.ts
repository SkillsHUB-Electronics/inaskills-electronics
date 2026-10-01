// Data contoh, dipakai saat Supabase belum dikonfigurasi. Hapus setelah data asli masuk.
import type { Alumni, Competition, HallOfFameEntry, Sponsor } from "@/types/database";

const alumni: Alumni[] = [
  { id: "a1", slug: "contoh-alumni-1", nama: "Contoh Alumni 1", foto_url: null, bio_id: "Peraih medali emas.", bio_en: "Gold medalist.", asal_daerah: "Jawa Timur", tahun_aktif: "2023", unggulan: true },
  { id: "a2", slug: "contoh-alumni-2", nama: "Contoh Alumni 2", foto_url: null, bio_id: "Peraih medali perak.", bio_en: "Silver medalist.", asal_daerah: "Jawa Barat", tahun_aktif: "2022", unggulan: true },
  { id: "a3", slug: "contoh-alumni-3", nama: "Contoh Alumni 3", foto_url: null, bio_id: "Medallion of Excellence.", bio_en: "Medallion of Excellence.", asal_daerah: "DKI Jakarta", tahun_aktif: "2024", unggulan: true },
];

const competitions: Competition[] = [
  { id: "c1", slug: "wsc-2024", nama_id: "WorldSkills Competition 2024", nama_en: "WorldSkills Competition 2024", level: "wsc", tahun: 2024, lokasi: "Lyon, Prancis", tanggal: "2024-09-10", overview_id: "Contoh ringkasan kompetisi.", overview_en: "Sample competition overview.", cover_url: null },
  { id: "c2", slug: "asc-2023", nama_id: "ASEAN Skills Competition 2023", nama_en: "ASEAN Skills Competition 2023", level: "asc", tahun: 2023, lokasi: "Singapura", tanggal: "2023-07-20", overview_id: "Contoh ringkasan kompetisi.", overview_en: "Sample competition overview.", cover_url: null },
  { id: "c3", slug: "lksn-2023", nama_id: "LKS Nasional 2023", nama_en: "National Skills Competition 2023", level: "nasional", tahun: 2023, lokasi: "Indonesia", tanggal: "2023-05-15", overview_id: "Contoh ringkasan kompetisi.", overview_en: "Sample competition overview.", cover_url: null },
];

export const sample = {
  competitions,
  sponsors: [] as Sponsor[],
  hallOfFame: [
    { id: "r1", competition_id: "c1", alumni_id: "a3", medali: "moe", peringkat: null, catatan: null, alumni: alumni[2], competition: competitions[0] },
    { id: "r2", competition_id: "c2", alumni_id: "a1", medali: "gold", peringkat: 1, catatan: null, alumni: alumni[0], competition: competitions[1] },
    { id: "r3", competition_id: "c3", alumni_id: "a2", medali: "silver", peringkat: 2, catatan: null, alumni: alumni[1], competition: competitions[2] },
  ] as HallOfFameEntry[],
  stats: { medals: 0, competitions: 0, alumni: 0, countries: 0 },
};
