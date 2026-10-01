"use client";

import { useCallback, useEffect, useState } from "react";
import { list, remove, type Row } from "@/lib/mutations";

export default function AdminMessagesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    list("contact_messages", "created_at", false).then(setRows).catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  async function onDelete(id: string) {
    if (!confirm("Hapus pesan ini?")) return;
    await remove("contact_messages", id).catch((e) => setError(e.message));
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Pesan Masuk</h1>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {rows.length === 0 && !error && <p className="mt-6 text-slate-500">Belum ada pesan.</p>}
      <div className="mt-6 space-y-4">
        {rows.map((m) => (
          <article key={String(m.id)} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold">
                  {String(m.nama)}
                  {m.perusahaan ? <span className="font-normal text-slate-500"> · {String(m.perusahaan)}</span> : null}
                </p>
                <p className="text-sm">
                  <a href={`mailto:${m.email}`} className="text-brand hover:underline">{String(m.email)}</a>
                  {m.telepon ? <> · {String(m.telepon)}</> : null}
                </p>
              </div>
              <time className="text-xs text-slate-500">{new Date(String(m.created_at)).toLocaleString("id-ID")}</time>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{String(m.pesan)}</p>
            <button type="button" onClick={() => onDelete(String(m.id))} className="mt-3 text-sm font-semibold text-red-600 hover:underline">
              Hapus
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
