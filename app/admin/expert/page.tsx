"use client";

import { useEffect, useState } from "react";
import CrudManager, { type Field } from "@/components/admin/CrudManager";
import { list, listUsers } from "@/lib/mutations";

export default function AdminExpertPage() {
  const [alumni, setAlumni] = useState<{ value: string; label: string }[]>([{ value: "", label: "Bukan alumni" }]);

  const [users, setUsers] = useState<{ value: string; label: string }[]>([{ value: "", label: "Belum ditautkan" }]);

  useEffect(() => {
    listUsers()
      .then((rows) => setUsers([{ value: "", label: "Belum ditautkan" }, ...rows.map((u) => ({ value: u.id, label: `${u.nama || u.email} (${u.email})` }))]))
      .catch(() => {});
    list("alumni", "nama")
      .then((rows) => setAlumni([{ value: "", label: "Bukan alumni" }, ...rows.map((a) => ({ value: String(a.id), label: String(a.nama) }))]))
      .catch(() => {});
  }, []);

  const fields: Field[] = [
    { name: "nama", label: "Nama", type: "text", required: true },
    { name: "alumni_id", label: "Alumni (pilih bila expert ini juga alumni)", type: "select", options: alumni },
    { name: "user_id", label: "Akun pengguna (opsional; profil akun ikut tersinkron)", type: "select", options: users },
    { name: "lokasi", label: "Lokasi", type: "text" },
    { name: "pekerjaan", label: "Pekerjaan", type: "text" },
    { name: "instansi", label: "Instansi / perusahaan", type: "text" },
    { name: "foto_url", label: "Foto (kosong = pakai foto alumni)", type: "image", bucket: "alumni" },
    { name: "bio_id", label: "Bio (Indonesia)", type: "textarea" },
    { name: "bio_en", label: "Bio (English)", type: "textarea" },
    { name: "quote_id", label: "Quote (Indonesia)", type: "text" },
    { name: "quote_en", label: "Quote (English)", type: "text" },
    { name: "keahlian", label: "Keahlian", type: "tags", wide: true },
    { name: "linkedin_url", label: "LinkedIn", type: "url" },
    { name: "github_url", label: "GitHub", type: "url" },
    { name: "instagram_url", label: "Instagram", type: "url" },
    { name: "kontak_email", label: "Email publik (kosong = tidak ditampilkan)", type: "text" },
    { name: "kontak_telepon", label: "Telepon publik (kosong = tidak ditampilkan)", type: "text" },
  ];

  return (
    <CrudManager
      key={`${alumni.length}-${users.length}`}
      title="Expert"
      table="experts"
      fields={fields}
      order="nama"
      slugFrom="nama"
      columns={[
        { name: "nama", label: "Nama" },
        { name: "instansi", label: "Instansi" },
        { name: "alumni_id", label: "Alumni", render: (r) => (r.alumni_id ? "Ya" : "–") },
        { name: "user_id", label: "Akun", render: (r) => (r.user_id ? "Terhubung" : "–") },
      ]}
    />
  );
}
