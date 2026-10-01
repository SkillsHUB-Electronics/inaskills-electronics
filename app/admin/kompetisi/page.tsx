"use client";

import CrudManager, { type Field } from "@/components/admin/CrudManager";
import ResultEditor from "@/components/admin/ResultEditor";
import GalleryEditor from "@/components/admin/GalleryEditor";
import { levels } from "@/lib/levels";
import id from "@/dictionaries/id.json";

const fields: Field[] = [
  { name: "nama_id", label: "Nama kompetisi (Indonesia)", type: "text", required: true },
  { name: "nama_en", label: "Nama kompetisi (English)", type: "text" },
  { name: "slug", label: "Slug URL (kosongkan = otomatis)", type: "text" },
  { name: "level", label: "Level", type: "select", required: true, options: levels.map((l) => ({ value: l, label: id.levels[l] })) },
  { name: "tahun", label: "Tahun", type: "number", required: true },
  { name: "tanggal", label: "Tanggal", type: "date" },
  { name: "lokasi", label: "Lokasi", type: "text", wide: true },
  { name: "cover_url", label: "Foto sampul", type: "image", bucket: "competitions" },
  { name: "overview_id", label: "Ringkasan (Indonesia)", type: "textarea" },
  { name: "overview_en", label: "Overview (English)", type: "textarea" },
];

export default function AdminCompetitionsPage() {
  return (
    <CrudManager
      title="Kompetisi"
      table="competitions"
      fields={fields}
      order="tahun"
      ascending={false}
      slugFrom="nama_id"
      columns={[
        { name: "nama_id", label: "Nama" },
        { name: "level", label: "Level", render: (r) => id.levels[r.level as keyof typeof id.levels] },
        { name: "tahun", label: "Tahun" },
      ]}
      renderExtra={(row) => (
        <>
          <ResultEditor competitionId={String(row.id)} />
          <GalleryEditor competitionId={String(row.id)} />
        </>
      )}
    />
  );
}
