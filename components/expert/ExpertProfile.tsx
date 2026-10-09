"use client";

import AlumniProfile from "@/components/alumni/AlumniProfile";
import type { AlumniDetail } from "@/lib/queries";
import type { ExpertDetail } from "@/types/database";

// Profil expert memakai tampilan yang sama dengan profil alumni; data expert dipetakan ke bentuk alumni.
export default function ExpertProfile({ expert: e }: { expert: ExpertDetail }) {
  const data: AlumniDetail = {
    alumni: {
      id: e.id,
      slug: e.slug,
      nama: e.nama,
      foto_url: e.foto_url,
      bio_id: e.bio_id ?? "",
      bio_en: e.bio_en ?? "",
      asal_daerah: null,
      tahun_aktif: null,
      unggulan: false,
      linkedin_url: e.linkedin_url,
      github_url: e.github_url,
      instagram_url: e.instagram_url,
      pekerjaan: e.pekerjaan,
      instansi: e.instansi,
      lokasi: e.lokasi,
      keahlian: e.keahlian,
      quote_id: e.quote_id,
      quote_en: e.quote_en,
      kontak_email: e.kontak_email,
      kontak_telepon: e.kontak_telepon,
    },
    results: [],
    expertOf: e.competition_experts,
  };
  return <AlumniProfile data={data} kind="expert" />;
}
