"use client";

import CrudManager, { type Field } from "@/components/admin/CrudManager";

const fields: Field[] = [
  { name: "judul_id", label: "Judul (Indonesia)", type: "text", required: true },
  { name: "judul_en", label: "Title (English)", type: "text" },
  { name: "tanggal", label: "Tanggal", type: "date", required: true },
  { name: "cover_url", label: "Gambar sampul", type: "image", bucket: "news" },
  { name: "ringkasan_id", label: "Ringkasan (Indonesia)", type: "textarea" },
  { name: "ringkasan_en", label: "Summary (English)", type: "textarea" },
  { name: "isi_id", label: "Isi berita (Indonesia)", type: "textarea" },
  { name: "isi_en", label: "Content (English)", type: "textarea" },
  { name: "terbit", label: "Terbitkan (tampil di situs)", type: "checkbox" },
];

export default function AdminNewsPage() {
  return (
    <CrudManager
      title="Berita"
      table="news"
      fields={fields}
      order="tanggal"
      ascending={false}
      slugFrom="judul_id"
      columns={[
        { name: "judul_id", label: "Judul" },
        { name: "tanggal", label: "Tanggal" },
        { name: "terbit", label: "Status", render: (r) => (r.terbit ? "Terbit" : "Draf") },
      ]}
    />
  );
}
