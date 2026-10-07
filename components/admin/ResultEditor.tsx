"use client";

import { useCallback, useEffect, useState } from "react";
import { inputClass } from "@/components/admin/CrudManager";
import { list, remove, save, type Row } from "@/lib/mutations";
import id from "@/dictionaries/id.json";

const medals = Object.entries(id.medals);

export default function ResultEditor({ competitionId }: { competitionId: string }) {
  const [results, setResults] = useState<Row[]>([]);
  const [alumni, setAlumni] = useState<Row[]>([]);
  const [form, setForm] = useState({ alumni_id: "", medali: "gold", peringkat: "" });
  const [error, setError] = useState("");

  const load = useCallback(() => {
    list("results", "peringkat", true, ["competition_id", competitionId]).then(setResults).catch((e) => setError(e.message));
  }, [competitionId]);

  useEffect(() => {
    load();
    list("alumni", "nama").then(setAlumni).catch((e) => setError(e.message));
  }, [load]);

  const name = (alumniId: unknown) => String(alumni.find((a) => a.id === alumniId)?.nama ?? "–");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    try {
      await save("results", {
        competition_id: competitionId,
        alumni_id: form.alumni_id,
        medali: form.medali,
        peringkat: form.peringkat ? Number(form.peringkat) : null,
      });
      setForm((f) => ({ ...f, alumni_id: "", peringkat: "" }));
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-6">
      <h2 className="text-lg font-bold">Hasil / Juara</h2>
      <p className="text-sm text-slate-500">Alumni yang meraih medali otomatis tampil di Hall of Fame (bisa juga dikelola di menu Hall of Fame).</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ul className="mt-4 divide-y divide-slate-200">
        {results.map((r) => (
          <li key={String(r.id)} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span>
              <b>{r.peringkat ? `#${r.peringkat} ` : ""}</b>
              {name(r.alumni_id)} · {id.medals[r.medali as keyof typeof id.medals]}
            </span>
            <button type="button" onClick={() => remove("results", String(r.id)).then(load)} className="font-semibold text-red-600 hover:underline">
              Hapus
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
        <label className="text-sm font-medium sm:col-span-2">
          Alumni
          <select required value={form.alumni_id} onChange={(e) => setForm({ ...form, alumni_id: e.target.value })} className={inputClass}>
            <option value="">Pilih alumni...</option>
            {alumni.map((a) => (
              <option key={String(a.id)} value={String(a.id)}>
                {String(a.nama)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Medali
          <select value={form.medali} onChange={(e) => setForm({ ...form, medali: e.target.value })} className={inputClass}>
            {medals.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Peringkat
          <input type="number" min={1} value={form.peringkat} onChange={(e) => setForm({ ...form, peringkat: e.target.value })} className={inputClass} />
        </label>
        <button type="submit" className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink-soft sm:col-span-4 sm:justify-self-start">
          + Tambah hasil
        </button>
      </form>
      {alumni.length === 0 && <p className="mt-2 text-sm text-slate-500">Tambahkan alumni dulu di menu Alumni.</p>}
    </section>
  );
}
