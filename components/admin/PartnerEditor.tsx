"use client";

import { useCallback, useEffect, useState } from "react";
import { inputClass } from "@/components/admin/CrudManager";
import ImageUploader from "@/components/admin/ImageUploader";
import { list, remove, save, type Row } from "@/lib/mutations";

const empty = { nama: "", logo_url: "", website: "" };

export default function PartnerEditor({ competitionId }: { competitionId: string }) {
  const [partners, setPartners] = useState<Row[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    list("competition_partners", "urutan", true, ["competition_id", competitionId]).then(setPartners).catch((e) => setError(e.message));
  }, [competitionId]);

  useEffect(load, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await save("competition_partners", {
        competition_id: competitionId,
        nama: form.nama.trim(),
        logo_url: form.logo_url || null,
        website: form.website.trim() || null,
        urutan: partners.length,
      });
      setForm(empty);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-6">
      <h2 className="text-lg font-bold">Partners &amp; Supporter</h2>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ul className="mt-4 divide-y divide-slate-200">
        {partners.map((p) => (
          <li key={String(p.id)} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="flex min-w-0 items-center gap-3">
              {p.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={String(p.logo_url)} alt="" className="h-8 w-12 shrink-0 object-contain" />
              ) : null}
              <b className="truncate">{String(p.nama)}</b>
            </span>
            <button type="button" onClick={() => remove("competition_partners", String(p.id)).then(load)} className="shrink-0 font-semibold text-red-600 hover:underline">
              Hapus
            </button>
          </li>
        ))}
      </ul>
      {partners.length === 0 && <p className="mt-2 text-sm text-slate-500">Belum ada partner.</p>}

      <form onSubmit={add} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Nama
          <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className={inputClass} />
        </label>
        <label className="text-sm font-medium">
          Website (opsional)
          <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" className={inputClass} />
        </label>
        <div className="text-sm font-medium sm:col-span-2">
          Logo
          <ImageUploader bucket="sponsors" value={form.logo_url} onChange={(url) => setForm({ ...form, logo_url: url })} />
        </div>
        <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink-soft sm:justify-self-start">
          + Tambah partner
        </button>
      </form>
    </section>
  );
}
