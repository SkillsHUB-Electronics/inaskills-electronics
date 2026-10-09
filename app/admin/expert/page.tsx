"use client";

import { useEffect, useState } from "react";
import CrudManager, { type Field } from "@/components/admin/CrudManager";
import { list } from "@/lib/mutations";

export default function AdminExpertPage() {
  const [alumni, setAlumni] = useState<{ value: string; label: string }[]>([{ value: "", label: "Bukan alumni" }]);

  useEffect(() => {
    list("alumni", "nama")
      .then((rows) => setAlumni([{ value: "", label: "Bukan alumni" }, ...rows.map((a) => ({ value: String(a.id), label: String(a.nama) }))]))
      .catch(() => {});
  }, []);

  const fields: Field[] = [
    { name: "nama", label: "Nama", type: "text", required: true },
    { name: "alumni_id", label: "Alumni (pilih bila expert ini juga alumni)", type: "select", options: alumni },
    { name: "pekerjaan", label: "Pekerjaan", type: "text" },
    { name: "instansi", label: "Instansi / perusahaan", type: "text" },
    { name: "foto_url", label: "Foto (kosong = pakai foto alumni)", type: "image", bucket: "alumni" },
    { name: "bio_id", label: "Bio (Indonesia)", type: "textarea" },
    { name: "bio_en", label: "Bio (English)", type: "textarea" },
    { name: "linkedin_url", label: "LinkedIn", type: "url" },
  ];

  return (
    <CrudManager
      key={alumni.length}
      title="Expert"
      table="experts"
      fields={fields}
      order="nama"
      slugFrom="nama"
      columns={[
        { name: "nama", label: "Nama" },
        { name: "instansi", label: "Instansi" },
        { name: "alumni_id", label: "Alumni", render: (r) => (r.alumni_id ? "Ya" : "–") },
      ]}
    />
  );
}
