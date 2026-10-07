"use client";

import { useCallback, useEffect, useState } from "react";
import { inputClass } from "@/components/admin/CrudManager";
import { linkUserToAlumni, list, listUsers, setAdmin, unlinkUserFromAlumni, type Row, type UserRow } from "@/lib/mutations";
import { useSession } from "@/lib/useSession";

const NEW = "__new__";

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "–";
}

export default function AdminUsersPage() {
  const { session } = useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [alumni, setAlumni] = useState<Row[]>([]);
  const [linking, setLinking] = useState<{ userId: string; alumniId: string } | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    Promise.all([listUsers(), list("alumni", "nama")])
      .then(([u, a]) => {
        setUsers(u);
        setAlumni(a);
      })
      .catch((e) => setMessage(`Gagal memuat: ${e.message}`));
  }, []);

  useEffect(load, [load]);

  async function run(action: () => Promise<unknown>, done: string) {
    setMessage("");
    try {
      await action();
      setMessage(done);
      setLinking(null);
      load();
    } catch (e) {
      setMessage(`Gagal: ${(e as Error).message}`);
    }
  }

  function toggleAdmin(u: UserRow) {
    const label = u.nama || u.email;
    if (!confirm(u.is_admin ? `Cabut hak admin ${label}?` : `Jadikan ${label} admin? Admin bisa mengubah semua isi situs.`)) return;
    run(() => setAdmin(u.id, !u.is_admin), u.is_admin ? "Hak admin dicabut." : "Berhasil dijadikan admin.");
  }

  const freeAlumni = alumni.filter((a) => !a.user_id);
  const q = query.trim().toLowerCase();
  const shown = users.filter((u) => !q || u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));

  return (
    <div>
      <h1 className="text-2xl font-bold">Pengguna</h1>
      <p className="text-sm text-slate-500">
        Semua akun yang mendaftar lewat halaman Masuk. Hubungkan akun ke alumni agar bisa dipilih di Hall of Fame, atau jadikan admin.
      </p>
      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}

      <input placeholder="Cari nama atau email..." value={query} onChange={(e) => setQuery(e.target.value)} className={`${inputClass} mt-4 max-w-sm`} />

      <ul className="mt-4 divide-y divide-slate-200 rounded-2xl bg-white ring-1 ring-slate-200">
        {shown.length === 0 && <li className="px-4 py-6 text-center text-sm text-slate-500">Belum ada akun.</li>}
        {shown.map((u) => (
          <li key={u.id} className="flex flex-col gap-3 px-4 py-4 text-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {u.nama || <span className="italic text-slate-400">Tanpa nama</span>}
                {u.is_admin && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">Admin</span>}
                {u.id === session?.user.id && <span className="text-xs font-normal text-slate-400">(Anda)</span>}
              </p>
              <p className="truncate text-slate-500">{u.email}</p>
              <p className="text-xs text-slate-400">
                Daftar {fmt(u.created_at)} · Terakhir masuk {fmt(u.last_sign_in_at)}
              </p>
              <p className="mt-1 text-xs">
                {u.alumni_id ? (
                  <span className="text-emerald-700">Alumni: {u.alumni_nama}</span>
                ) : (
                  <span className="text-slate-400">Belum terhubung ke alumni</span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {linking?.userId === u.id ? (
                <>
                  <select value={linking.alumniId} onChange={(e) => setLinking({ userId: u.id, alumniId: e.target.value })} className={`${inputClass} mt-0 w-56`}>
                    <option value={NEW}>+ Buat alumni baru dari akun ini</option>
                    {freeAlumni.map((a) => (
                      <option key={String(a.id)} value={String(a.id)}>
                        {String(a.nama)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => run(() => linkUserToAlumni(u, linking.alumniId === NEW ? null : linking.alumniId, alumni), "Akun terhubung ke alumni.")}
                    className="rounded-full bg-ink px-4 py-2 font-semibold text-white hover:bg-ink-soft"
                  >
                    Hubungkan
                  </button>
                  <button type="button" onClick={() => setLinking(null)} className="px-2 font-semibold text-slate-500">
                    Batal
                  </button>
                </>
              ) : u.alumni_id ? (
                <button
                  type="button"
                  onClick={() => confirm("Putuskan hubungan akun dengan data alumni? Data alumni tetap ada.") && run(() => unlinkUserFromAlumni(u.alumni_id!), "Hubungan diputus.")}
                  className="rounded-full px-4 py-2 font-semibold text-slate-600 ring-1 ring-slate-300 hover:bg-slate-100"
                >
                  Putuskan alumni
                </button>
              ) : (
                <button type="button" onClick={() => setLinking({ userId: u.id, alumniId: NEW })} className="rounded-full px-4 py-2 font-semibold text-ink ring-1 ring-slate-300 hover:bg-slate-100">
                  Hubungkan ke alumni
                </button>
              )}
              {u.id !== session?.user.id && (
                <button
                  type="button"
                  onClick={() => toggleAdmin(u)}
                  className={`rounded-full px-4 py-2 font-semibold ${u.is_admin ? "text-red-600 ring-1 ring-red-200 hover:bg-red-50" : "bg-brand text-white hover:bg-brand-dark"}`}
                >
                  {u.is_admin ? "Cabut admin" : "Jadikan admin"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
