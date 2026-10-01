"use client";

import CrudManager, { type Field } from "@/components/admin/CrudManager";

const fields: Field[] = [
  { name: "nama", label: "Nama sponsor", type: "text", required: true },
  { name: "website", label: "Website", type: "text" },
  { name: "tier", label: "Tier (mis. Platinum, Gold)", type: "text" },
  { name: "urutan", label: "Urutan tampil (kecil = duluan)", type: "number" },
  { name: "logo_url", label: "Logo", type: "image", bucket: "sponsors" },
  { name: "aktif", label: "Tampilkan di situs", type: "checkbox" },
];

export default function AdminSponsorPage() {
  return (
    <CrudManager
      title="Sponsor"
      table="sponsors"
      fields={fields}
      order="urutan"
      columns={[
        {
          name: "logo_url",
          label: "Logo",
          // eslint-disable-next-line @next/next/no-img-element
          render: (r) => (r.logo_url ? <img src={String(r.logo_url)} alt="" className="h-8 max-w-24 object-contain" /> : "–"),
        },
        { name: "nama", label: "Nama" },
        { name: "tier", label: "Tier" },
        { name: "aktif", label: "Aktif", render: (r) => (r.aktif ? "Ya" : "Tidak") },
      ]}
    />
  );
}
