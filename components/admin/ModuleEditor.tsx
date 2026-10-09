"use client";

import { useCallback, useEffect, useState } from "react";
import { inputClass } from "@/components/admin/CrudManager";
import { list, remove, save, type Row } from "@/lib/mutations";

const empty = { judul_id: "", judul_en: "", deskripsi_id: "", deskripsi_en: "" };

export default function ModuleEditor({ competitionId }: { competitionId: string }) {
  const [modules, setModules] = useState<Row[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    list("competition_modules", "urutan", true, ["competition_id", competitionId]).then(setModules).catch((e) => setError(e.message));
  }, [competitionId]);

  useEffect(load, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await save("competition_modules", {
        competition_id: competitionId,
        judul_id: form.judul_id.trim(),
        judul_en: form.judul_en.trim() || null,
        deskripsi_id: form.deskripsi_id.trim() || null,
        deskripsi_en: form.deskripsi_en.trim() || null,
        urutan: modules.length,
      });
      setForm(empty);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-6">
      <h2 className="text-lg font-bold">Modul / Task Project Breakdown</h2>
      <p className="text-sm text-slate-500">Satu kompetisi bisa punya banyak modul.</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ol className="mt-4 divide-y divide-slate-200">
        {modules.map((m, i) => (
          <li key={String(m.id)} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="min-w-0">
              <b>{i + 1}. {String(m.judul_id)}</b>
              {m.judul_en ? <span className="text-slate-500"> · {String(m.judul_en)}</span> : null}
            </span>
            <button type="button" onClick={() => remove("competition_modules", String(m.id)).then(load)} className="shrink-0 font-semibold text-red-600 hover:underline">
              Hapus
            </button>
          </li>
        ))}
      </ol>
      {modules.length === 0 && <p className="mt-2 text-sm text-slate-500">Belum ada modul.</p>}

      <form onSubmit={add} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Judul (Indonesia)
          <input required value={form.judul_id} onChange={(e) => setForm({ ...form, judul_id: e.target.value })} className={inputClass} />
        </label>
        <label className="text-sm font-medium">
          Title (English)
          <input value={form.judul_en} onChange={(e) => setForm({ ...form, judul_en: e.target.value })} className={inputClass} />
        </label>
        <label className="text-sm font-medium">
          Deskripsi (Indonesia, opsional)
          <textarea rows={3} value={form.deskripsi_id} onChange={(e) => setForm({ ...form, deskripsi_id: e.target.value })} className={inputClass} />
        </label>
        <label className="text-sm font-medium">
          Description (English, optional)
          <textarea rows={3} value={form.deskripsi_en} onChange={(e) => setForm({ ...form, deskripsi_en: e.target.value })} className={inputClass} />
        </label>
        <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink-soft sm:justify-self-start">
          + Tambah modul
        </button>
      </form>
    </section>
  );
}
