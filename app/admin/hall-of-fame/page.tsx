"use client";

import { useCallback, useEffect, useState } from "react";
import { inputClass } from "@/components/admin/CrudManager";
import ImageUploader from "@/components/admin/ImageUploader";
import LevelBadge from "@/components/ui/LevelBadge";
import { hofMedals, levelShort, levelsByRank, type Level } from "@/lib/levels";
import { insertReturningId, linkUserToAlumni, list, listUsers, remove, save, uniqueSlug, type Row, type UserRow } from "@/lib/mutations";
import { supabase } from "@/lib/supabase";
import id from "@/dictionaries/id.json";

const NEW = "__new__";
const USER = "user:";

type Entry = Row & {
  alumni: { nama: string } | null;
  competition: { nama_id: string; level: Level; tahun: number } | null;
};

const emptyForm = {
  id: "",
  alumni_id: "",
  alumni_baru: "",
  competition_id: "",
  komp_nama: "",
  komp_level: "wsc" as Level,
  komp_tahun: String(new Date().getFullYear()),
  medali: "gold",
  peringkat: "",
  foto_url: "",
  catatan: "",
  catatan_en: "",
};
type Form = typeof emptyForm;

export default function AdminHallOfFamePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [alumni, setAlumni] = useState<Row[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [competitions, setCompetitions] = useState<Row[]>([]);
  const [filter, setFilter] = useState<Level | "all">("all");
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    if (!supabase) return;
    Promise.all([
      supabase
        .from("results")
        .select("*, alumni(nama), competition:competitions(nama_id, level, tahun)")
        .in("medali", [...hofMedals])
        .order("created_at", { ascending: false }),
      list("alumni", "nama"),
      list("competitions", "tahun", false),
      // Akun terdaftar yang belum jadi alumni, agar bisa langsung dipilih.
      listUsers().catch(() => [] as UserRow[]),
    ])
      .then(([res, al, co, us]) => {
        if (res.error) throw res.error;
        setEntries(res.data as Entry[]);
        setAlumni(al);
        setCompetitions(co);
        setUsers(us.filter((u) => !u.alumni_id));
      })
      .catch((e) => setMessage(`Gagal memuat: ${e.message}`));
  }, []);

  useEffect(load, [load]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  function edit(e: Entry) {
    setMessage("");
    setForm({
      ...emptyForm,
      id: String(e.id),
      alumni_id: String(e.alumni_id),
      competition_id: String(e.competition_id),
      medali: String(e.medali),
      peringkat: e.peringkat ? String(e.peringkat) : "",
      foto_url: String(e.foto_url ?? ""),
      catatan: String(e.catatan ?? ""),
      catatan_en: String(e.catatan_en ?? ""),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form) return;
    setBusy(true);
    setMessage("");
    try {
      // Alumni / kompetisi baru dibuat dulu bila dipilih "+ Baru".
      const user = users.find((u) => `${USER}${u.id}` === form.alumni_id);
      const alumniId =
        form.alumni_id === NEW
          ? await insertReturningId("alumni", { nama: form.alumni_baru.trim(), slug: uniqueSlug(form.alumni_baru, alumni) })
          : user
            ? await linkUserToAlumni(user, null, alumni)
            : form.alumni_id;
      const competitionId =
        form.competition_id === NEW
          ? await insertReturningId("competitions", {
              nama_id: form.komp_nama.trim(),
              nama_en: form.komp_nama.trim(),
              level: form.komp_level,
              tahun: Number(form.komp_tahun),
              slug: uniqueSlug(form.komp_nama, competitions),
            })
          : form.competition_id;
      await save("results", {
        id: form.id || undefined,
        alumni_id: alumniId,
        competition_id: competitionId,
        medali: form.medali,
        peringkat: form.peringkat ? Number(form.peringkat) : null,
        foto_url: form.foto_url || null,
        catatan: form.catatan.trim() || null,
        catatan_en: form.catatan_en.trim() || null,
      });
      setForm(null);
      setMessage("Tersimpan. Juara langsung tampil di Hall of Fame.");
      load();
    } catch (err) {
      setMessage(`Gagal menyimpan: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(e: Entry) {
    if (!confirm(`Hapus ${e.alumni?.nama ?? "juara ini"} dari Hall of Fame?`)) return;
    try {
      await remove("results", String(e.id));
      load();
    } catch (err) {
      setMessage(`Gagal menghapus: ${(err as Error).message}`);
    }
  }

  const selectedComp = competitions.find((c) => c.id === form?.competition_id);
  const groups = levelsByRank
    .filter((l) => filter === "all" || l === filter)
    .map((l) => ({ level: l, items: entries.filter((e) => e.competition?.level === l) }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hall of Fame</h1>
          <p className="text-sm text-slate-500">Juara (Emas, Perak, Perunggu, MoE) per tingkat lomba.</p>
        </div>
        {!form && (
          <button type="button" onClick={() => setForm({ ...emptyForm })} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            + Tambah juara
          </button>
        )}
      </div>
      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}

      {form && (
        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-6 md:grid-cols-2">
          <h2 className="text-lg font-bold md:col-span-2">{form.id ? "Edit juara" : "Tambah juara"}</h2>

          <div>
            <label className="block text-sm font-medium">
              Alumni *
              <select required value={form.alumni_id} onChange={(e) => set("alumni_id", e.target.value)} className={inputClass}>
                <option value="">Pilih alumni...</option>
                <optgroup label="Alumni">
                  {alumni.map((a) => (
                    <option key={String(a.id)} value={String(a.id)}>
                      {String(a.nama)}
                    </option>
                  ))}
                </optgroup>
                {users.length > 0 && (
                  <optgroup label="Akun terdaftar (belum alumni)">
                    {users.map((u) => (
                      <option key={u.id} value={`${USER}${u.id}`}>
                        {u.nama || u.email} ({u.email})
                      </option>
                    ))}
                  </optgroup>
                )}
                <option value={NEW}>+ Alumni baru...</option>
              </select>
            </label>
            {form.alumni_id === NEW && (
              <label className="mt-2 block text-sm font-medium">
                Nama alumni baru *
                <input required value={form.alumni_baru} onChange={(e) => set("alumni_baru", e.target.value)} className={inputClass} />
                <span className="text-xs font-normal text-slate-500">Foto & bio bisa dilengkapi nanti di menu Alumni.</span>
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">
              Kompetisi *
              <select required value={form.competition_id} onChange={(e) => set("competition_id", e.target.value)} className={inputClass}>
                <option value="">Pilih kompetisi...</option>
                {levelsByRank.map((l) => {
                  const items = competitions.filter((c) => c.level === l);
                  return items.length ? (
                    <optgroup key={l} label={id.levels[l]}>
                      {items.map((c) => (
                        <option key={String(c.id)} value={String(c.id)}>
                          {String(c.nama_id)} ({String(c.tahun)})
                        </option>
                      ))}
                    </optgroup>
                  ) : null;
                })}
                <option value={NEW}>+ Kompetisi baru...</option>
              </select>
            </label>
            {selectedComp && (
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <LevelBadge level={selectedComp.level as Level} label={id.levels[selectedComp.level as Level]} />
                Tahun {String(selectedComp.tahun)}
              </p>
            )}
            {form.competition_id === NEW && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="col-span-2 block text-sm font-medium">
                  Nama kompetisi *
                  <input required placeholder="mis. WorldSkills Asia 2025" value={form.komp_nama} onChange={(e) => set("komp_nama", e.target.value)} className={inputClass} />
                </label>
                <label className="block text-sm font-medium">
                  Tingkat *
                  <select value={form.komp_level} onChange={(e) => set("komp_level", e.target.value as Level)} className={inputClass}>
                    {levelsByRank.map((l) => (
                      <option key={l} value={l}>
                        {id.levels[l]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Tahun *
                  <input required type="number" min={1950} max={2100} value={form.komp_tahun} onChange={(e) => set("komp_tahun", e.target.value)} className={inputClass} />
                </label>
              </div>
            )}
          </div>

          <label className="block text-sm font-medium">
            Medali *
            <select value={form.medali} onChange={(e) => set("medali", e.target.value)} className={inputClass}>
              {hofMedals.map((m) => (
                <option key={m} value={m}>
                  {id.medals[m]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Peringkat (opsional)
            <input type="number" min={1} value={form.peringkat} onChange={(e) => set("peringkat", e.target.value)} className={inputClass} />
          </label>

          <div className="text-sm font-medium md:col-span-2">
            Foto (opsional, kosong = pakai foto alumni)
            <ImageUploader bucket="competitions" value={form.foto_url} onChange={(url) => set("foto_url", url)} />
          </div>

          <label className="block text-sm font-medium">
            Catatan (Indonesia)
            <input placeholder="mis. Best of Nation" value={form.catatan} onChange={(e) => set("catatan", e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">
            Note (English)
            <input value={form.catatan_en} onChange={(e) => set("catatan_en", e.target.value)} className={inputClass} />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row md:col-span-2">
            <button type="submit" disabled={busy} className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
              {busy ? "Menyimpan..." : "Simpan"}
            </button>
            <button type="button" onClick={() => setForm(null)} className="rounded-full px-6 py-2.5 font-semibold text-slate-600 ring-1 ring-slate-300 hover:bg-slate-100">
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {(["all", ...levelsByRank] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setFilter(l)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${
              filter === l ? "bg-ink text-white ring-ink" : "bg-white text-slate-700 ring-slate-300 hover:ring-ink"
            }`}
          >
            {l === "all" ? `Semua (${entries.length})` : `${levelShort[l]} (${entries.filter((e) => e.competition?.level === l).length})`}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-6">
        {groups.map((g) => (
          <section key={g.level} className="rounded-2xl bg-white ring-1 ring-slate-200">
            <h2 className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 font-bold">
              <LevelBadge level={g.level} label={id.levels[g.level]} />
            </h2>
            {g.items.length === 0 ? (
              <p className="px-4 py-4 text-sm text-slate-500">Belum ada juara.</p>
            ) : (
              <ul className="divide-y divide-slate-200">
                {g.items.map((e) => (
                  <li key={String(e.id)} className="flex flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {e.alumni?.nama ?? "–"} · {id.medals[e.medali as keyof typeof id.medals]}
                        {e.peringkat ? ` (#${String(e.peringkat)})` : ""}
                      </p>
                      <p className="truncate text-slate-500">
                        {e.competition?.nama_id} · {e.competition?.tahun}
                        {e.catatan ? ` · ${String(e.catatan)}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 whitespace-nowrap">
                      <button type="button" onClick={() => edit(e)} className="font-semibold text-ink hover:text-brand">
                        Edit
                      </button>
                      <button type="button" onClick={() => onDelete(e)} className="ml-4 font-semibold text-red-600 hover:underline">
                        Hapus
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
