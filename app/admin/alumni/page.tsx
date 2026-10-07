"use client";

import CrudManager, { type Field } from "@/components/admin/CrudManager";

const fields: Field[] = [
  { name: "nama", label: "Nama", type: "text", required: true },
  { name: "asal_daerah", label: "Asal daerah", type: "text" },
  { name: "tahun_aktif", label: "Tahun aktif", type: "text" },
  { name: "pekerjaan", label: "Pekerjaan", type: "text" },
  { name: "instansi", label: "Instansi / perusahaan", type: "text" },
  { name: "foto_url", label: "Foto", type: "image", bucket: "alumni" },
  { name: "bio_id", label: "Bio (Indonesia)", type: "textarea" },
  { name: "bio_en", label: "Bio (English)", type: "textarea" },
  { name: "linkedin_url", label: "LinkedIn", type: "url" },
  { name: "github_url", label: "GitHub", type: "url" },
  { name: "instagram_url", label: "Instagram", type: "url" },
  { name: "unggulan", label: "Tampilkan sebagai alumni unggulan", type: "checkbox" },
];

export default function AdminAlumniPage() {
  return (
    <CrudManager
      title="Alumni"
      table="alumni"
      fields={fields}
      order="nama"
      slugFrom="nama"
      columns={[
        { name: "nama", label: "Nama" },
        { name: "asal_daerah", label: "Asal" },
        { name: "tahun_aktif", label: "Tahun" },
        { name: "user_id", label: "Akun", render: (r) => (r.user_id ? "Terhubung" : "–") },
      ]}
    />
  );
}
