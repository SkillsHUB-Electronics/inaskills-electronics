"use client";

import { useEffect, useState } from "react";
import CrudManager, { type Field } from "@/components/admin/CrudManager";
import { list } from "@/lib/mutations";
import id from "@/dictionaries/id.json";

const baseFields: Field[] = [
  { name: "judul_id", label: "Judul (Indonesia)", type: "text", required: true },
  { name: "judul_en", label: "Title (English)", type: "text" },
  {
    name: "kategori",
    label: "Kategori",
    type: "select",
    required: true,
    options: Object.entries(id.projects.categories).map(([value, label]) => ({ value, label })),
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "published", label: "Dipublikasikan" },
      { value: "under_development", label: "Dalam pengembangan" },
    ],
  },
  { name: "tahun", label: "Tahun", type: "number" },
  { name: "urutan", label: "Urutan tampil (kecil = duluan)", type: "number" },
  { name: "repo_url", label: "Link repository (GitHub/GitLab)", type: "url" },
  { name: "demo_url", label: "Link demo / video", type: "url" },
  { name: "file_url", label: "File unduhan (PDF/ZIP soal, dokumen)", type: "file", bucket: "projects" },
  { name: "cover_url", label: "Gambar sampul", type: "image", bucket: "projects" },
  { name: "deskripsi_id", label: "Deskripsi (Indonesia)", type: "textarea" },
  { name: "deskripsi_en", label: "Description (English)", type: "textarea" },
];

export default function AdminProjectsPage() {
  const [alumni, setAlumni] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    list("alumni", "nama")
      .then((rows) => setAlumni(rows.map((r) => ({ value: String(r.id), label: String(r.nama) }))))
      .catch(() => setAlumni([]));
  }, []);

  const fields: Field[] = [
    ...baseFields.slice(0, 6),
    { name: "alumni_id", label: "Alumni pembuat (opsional)", type: "select", options: [{ value: "", label: "Tidak ada" }, ...alumni] },
    ...baseFields.slice(6),
  ];

  return (
    <CrudManager
      title="Proyek & Riset"
      table="projects"
      fields={fields}
      order="urutan"
      slugFrom="judul_id"
      columns={[
        { name: "judul_id", label: "Judul" },
        { name: "kategori", label: "Kategori", render: (r) => id.projects.categories[r.kategori as keyof typeof id.projects.categories] },
        { name: "status", label: "Status", render: (r) => (r.status === "under_development" ? "Dalam pengembangan" : "Dipublikasikan") },
      ]}
    />
  );
}
