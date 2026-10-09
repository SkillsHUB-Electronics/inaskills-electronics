"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { inputClass } from "@/components/admin/CrudManager";
import { list, remove, save, type Row } from "@/lib/mutations";

// Memilih expert kompetisi dari daftar di menu Expert.
export default function ExpertEditor({ competitionId }: { competitionId: string }) {
  const [assigned, setAssigned] = useState<Row[]>([]);
  const [experts, setExperts] = useState<Row[]>([]);
  const [form, setForm] = useState({ expert_id: "", peran_id: "", peran_en: "" });
  const [error, setError] = useState("");

  const load = useCallback(() => {
    list("competition_experts", "urutan", true, ["competition_id", competitionId]).then(setAssigned).catch((e) => setError(e.message));
  }, [competitionId]);

  useEffect(() => {
    load();
    list("experts", "nama").then(setExperts).catch((e) => setError(e.message));
  }, [load]);

  const name = (id: unknown) => String(experts.find((x) => x.id === id)?.nama ?? "–");
  const available = experts.filter((x) => !assigned.some((a) => a.expert_id === x.id));

  async function add(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    try {
      await save("competition_experts", {
        competition_id: competitionId,
        expert_id: form.expert_id,
        peran_id: form.peran_id.trim() || null,
        peran_en: form.peran_en.trim() || null,
        urutan: assigned.length,
      });
      setForm({ expert_id: "", peran_id: "", peran_en: "" });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-6">
      <h2 className="text-lg font-bold">Expert / Pembimbing</h2>
      <p className="text-sm text-slate-500">
        Pilih dari daftar di menu <Link href="/admin/expert/" className="font-semibold text-brand hover:underline">Expert</Link>. Bisa lebih dari satu.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ul className="mt-4 divide-y divide-slate-200">
        {assigned.map((a) => (
          <li key={String(a.id)} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="min-w-0">
              <b>{name(a.expert_id)}</b>
              {a.peran_id ? ` · ${String(a.peran_id)}` : ""}
            </span>
            <button type="button" onClick={() => remove("competition_experts", String(a.id)).then(load)} className="shrink-0 font-semibold text-red-600 hover:underline">
              Hapus
            </button>
          </li>
        ))}
      </ul>
      {assigned.length === 0 && <p className="mt-2 text-sm text-slate-500">Belum ada expert.</p>}

      <form onSubmit={add} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">
          Expert
          <select required value={form.expert_id} onChange={(e) => setForm({ ...form, expert_id: e.target.value })} className={inputClass}>
            <option value="">Pilih expert...</option>
            {available.map((x) => (
              <option key={String(x.id)} value={String(x.id)}>
                {String(x.nama)}
              </option>
            ))}
          </select>
        </label>
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
      {experts.length === 0 && <p className="mt-2 text-sm text-slate-500">Tambahkan expert dulu di menu Expert.</p>}
    </section>
  );
}
