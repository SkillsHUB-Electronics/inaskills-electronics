"use client";

import { useState } from "react";
import { inputClass } from "@/components/admin/CrudManager";
import { supabase } from "@/lib/supabase";

export default function AdminAccountPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setStatus("Password minimal 8 karakter.");
    if (password !== confirm) return setStatus("Konfirmasi password tidak sama.");
    const { error } = (await supabase?.auth.updateUser({ password })) ?? { error: null };
    if (error) return setStatus(`Gagal: ${error.message}`);
    setPassword("");
    setConfirm("");
    setStatus("Password berhasil diganti.");
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold">Akun</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-6">
        <h2 className="font-bold">Ganti password</h2>
        <label className="block text-sm font-medium">
          Password baru
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm font-medium">
          Ulangi password baru
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
        </label>
        <button type="submit" className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-dark">
          Simpan
        </button>
        {status && <p className="text-sm text-slate-600">{status}</p>}
      </form>
      <p className="mt-6 text-sm text-slate-500">
        Menambah atau mengganti akun admin dilakukan di Supabase (Authentication &gt; Users dan tabel <code>admins</code>). Lihat README.
      </p>
    </div>
  );
}
