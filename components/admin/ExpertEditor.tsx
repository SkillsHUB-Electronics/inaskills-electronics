"use client";

import { useCallback, useEffect, useState } from "react";
import { inputClass } from "@/components/admin/CrudManager";
import ImageUploader from "@/components/admin/ImageUploader";
import { list, remove, save, type Row } from "@/lib/mutations";

const empty = { alumni_id: "", nama: "", foto_url: "", instansi: "", peran_id: "", peran_en: "" };

export default function ExpertEditor({ competitionId }: { competitionId: string }) {
  const [experts, setExperts] = useState<Row[]>([]);
  const [alumni, setAlumni] = useState<Row[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    list("competition_experts", "urutan", true, ["competition_id", competitionId]).then(setExperts).catch((e) => setError(e.message));
  }, [competitionId]);

  useEffect(() => {
    load();
    list("alumni", "nama").then(setAlumni).catch((e) => setError(e.message));
  }, [load]);

  const fromAlumni = Boolean(form.alumni_id);
  const label = (e: Row) => String(alumni.find((a) => a.id === e.alumni_id)?.nama ?? e.nama ?? "–");

  async function add(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    try {
      await save("competition_experts", {
        competition_id: competitionId,
        alumni_id: form.alumni_id || null,
        // Expert dari alumni memakai data alumni; field manual hanya untuk orang luar.
        nama: fromAlumni ? null : form.nama.trim(),
        foto_url: fromAlumni ? null : form.foto_url || null,
        instansi: fromAlumni ? null : form.instansi.trim() || null,
        peran_id: form.peran_id.trim() || null,
        peran_en: form.peran_en.trim() || null,
        urutan: experts.length,
      });
      setForm(empty);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-6">
      <h2 className="text-lg font-bold">Expert / Pembimbing</h2>
      <p className="text-sm text-slate-500">Bisa lebih dari satu per kompetisi. Pilih dari alumni, atau isi manual untuk orang luar.</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ul className="mt-4 divide-y divide-slate-200">
        {experts.map((e) => (
          <li key={String(e.id)} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="min-w-0">
              <b>{label(e)}</b>
              {e.alumni_id ? " · alumni" : e.instansi ? ` · ${String(e.instansi)}` : ""}
              {e.peran_id ? ` · ${String(e.peran_id)}` : ""}
            </span>
            <button type="button" onClick={() => remove("competition_experts", String(e.id)).then(load)} className="shrink-0 font-semibold text-red-600 hover:underline">
              Hapus
            </button>
          </li>
        ))}
      </ul>
      {experts.length === 0 && <p className="mt-2 text-sm text-slate-500">Belum ada expert.</p>}

      <form onSubmit={add} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">
          Alumni (kosongkan bila expert dari luar)
          <select value={form.alumni_id} onChange={(e) => setForm({ ...form, alumni_id: e.target.value })} className={inputClass}>
            <option value="">Orang luar (isi manual)</option>
            {alumni.map((a) => (
              <option key={String(a.id)} value={String(a.id)}>
                {String(a.nama)}
              </option>
            ))}
          </select>
        </label>
        {!fromAlumni && (
          <>
            <label className="text-sm font-medium">
              Nama
              <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className={inputClass} />
            </label>
            <label className="text-sm font-medium">
              Instansi
              <input value={form.instansi} onChange={(e) => setForm({ ...form, instansi: e.target.value })} className={inputClass} />
            </label>
            <div className="text-sm font-medium sm:col-span-2">
              Foto
              <ImageUploader bucket="alumni" value={form.foto_url} onChange={(url) => setForm({ ...form, foto_url: url })} />
            </div>
          </>
        )}
        <label className="text-sm font-medium">
          Peran (Indonesia, opsional)
          <input value={form.peran_id} onChange={(e) => setForm({ ...form, peran_id: e.target.value })} placeholder="Expert" className={inputClass} />
        </label>
        <label className="text-sm font-medium">
          Role (English, optional)
          <input value={form.peran_en} onChange={(e) => setForm({ ...form, peran_en: e.target.value })} placeholder="Expert" className={inputClass} />
        </label>
        <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink-soft sm:justify-self-start">
          + Tambah expert
        </button>
      </form>
    </section>
  );
}
