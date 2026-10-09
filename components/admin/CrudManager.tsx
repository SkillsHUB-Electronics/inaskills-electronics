"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ImageUploader from "@/components/admin/ImageUploader";
import { list, remove, save, uniqueSlug, type Row, type Table } from "@/lib/mutations";

export type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "richtext" | "number" | "date" | "select" | "combo" | "checkbox" | "image" | "file" | "url" | "tags";
  required?: boolean;
  // Hanya untuk field angka: true bila kolom DB boleh null. Bila tidak, angka kosong disimpan 0 (bukan null).
  nullable?: boolean;
  options?: { value: string; label: string }[];
  bucket?: string;
  // Lebar penuh di form 2 kolom (desktop).
  wide?: boolean;
};

type Props = {
  title: string;
  table: Table;
  fields: Field[];
  order: string;
  ascending?: boolean;
  // Kolom yang ditampilkan di daftar.
  columns: { name: string; label: string; render?: (row: Row) => React.ReactNode }[];
  // Isi slug otomatis dari field ini bila slug kosong.
  slugFrom?: string;
  // Konten tambahan di bawah form saat mengedit baris yang sudah ada (mis. hasil & galeri).
  renderExtra?: (row: Row) => React.ReactNode;
};

// Editor teks kaya dimuat terpisah hanya saat dibutuhkan, agar halaman lain tetap ringan.
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="mt-1 h-60 animate-pulse rounded-lg bg-slate-100" />,
});

export const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

function emptyRow(fields: Field[]): Row {
  return Object.fromEntries(fields.map((f) => [f.name, f.type === "checkbox" ? false : f.type === "number" && !f.nullable && !f.required ? 0 : f.type === "select" ? (f.options?.[0]?.value ?? "") : ""]));
}

// Dropdown dengan pilihan baku + "Lainnya..." untuk mengetik nilai baru; nilai lama di luar daftar tetap tampil.
function ComboField({ field, value, onChange }: { field: Field; value: string; onChange: (v: string) => void }) {
  const [custom, setCustom] = useState(false);
  const known = field.options?.some((o) => o.value === value) ?? false;
  const other = custom || (value !== "" && !known);
  return (
    <>
      <select
        value={other ? OTHER : value}
        onChange={(e) => {
          const v = e.target.value;
          setCustom(v === OTHER);
          onChange(v === OTHER ? "" : v);
        }}
        className={inputClass}
      >
        <option value="">-</option>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        <option value={OTHER}>Lainnya...</option>
      </select>
      {other && <input type="text" autoFocus={custom} placeholder="Ketik nama baru" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />}
    </>
  );
}

const OTHER = "__other__";

export default function CrudManager({ title, table, fields, order, ascending = true, columns, slugFrom, renderExtra }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    list(table, order, ascending)
      .then(setRows)
      .catch((e) => setMessage(`Gagal memuat: ${e.message}`));
  }, [table, order, ascending]);

  useEffect(load, [load]);

  async function onSubmit(e: React.FormEvent) {
    if (!editing) return;
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const row: Row = { ...editing };
      // Slug URL selalu otomatis dari nama/judul (unik), dan ikut berubah bila nama/judul diganti.
      if (slugFrom) {
        const original = rows.find((r) => r.id === row.id);
        if (!original || original[slugFrom] !== row[slugFrom] || !row.slug) row.slug = uniqueSlug(String(row[slugFrom] ?? ""), rows, row.id);
      }
      // Kolom angka/tanggal kosong disimpan sebagai null, bukan string kosong.
      // Kecuali angka yang kolomnya NOT NULL (mis. urutan): disimpan 0.
      for (const f of fields) {
        if (!["number", "date", "image", "file", "url", "select", "combo"].includes(f.type) || row[f.name] !== "") continue;
        row[f.name] = f.type === "number" && !f.nullable && !f.required ? 0 : null;
      }
      // Tags: teks dipisah koma disimpan sebagai array (tanpa duplikat), kosong = null.
      for (const f of fields) {
        if (f.type !== "tags") continue;
        const v = row[f.name];
        const items = typeof v === "string" ? [...new Set(v.split(",").map((s) => s.trim()).filter(Boolean))] : (v as string[] | null) ?? [];
        row[f.name] = items.length ? items : null;
      }
      await save(table, row);
      setMessage("Tersimpan.");
      setEditing(null);
      load();
    } catch (err) {
      setMessage(`Gagal menyimpan: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(row: Row) {
    if (!confirm("Hapus data ini? Tindakan ini tidak bisa dibatalkan.")) return;
    try {
      await remove(table, String(row.id));
      load();
    } catch (err) {
      setMessage(`Gagal menghapus: ${(err as Error).message}`);
    }
  }

  const set = (name: string, value: unknown) => setEditing((r) => (r ? { ...r, [name]: value } : r));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        {!editing && (
          <button type="button" onClick={() => setEditing(emptyRow(fields))} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            + Tambah
          </button>
        )}
      </div>
      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}

      {editing ? (
        <div className="mt-6 space-y-6">
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-6 md:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.wide || f.type === "textarea" || f.type === "richtext" || f.type === "image" || f.type === "file" ? "md:col-span-2" : ""}>
                {f.type === "checkbox" ? (
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input type="checkbox" checked={Boolean(editing[f.name])} onChange={(e) => set(f.name, e.target.checked)} />
                    {f.label}
                  </label>
                ) : f.type === "richtext" ? (
                  <div className="text-sm font-medium">
                    {f.label}
                    {/* key: editor dibuat ulang saat berpindah baris yang diedit. */}
                    <RichTextEditor key={String(editing.id ?? "new")} bucket={f.bucket ?? "news"} value={String(editing[f.name] ?? "")} onChange={(html) => set(f.name, html)} />
                  </div>
                ) : f.type === "image" || f.type === "file" ? (
                  <div className="text-sm font-medium">
                    {f.label}
                    <ImageUploader kind={f.type} bucket={f.bucket!} value={(editing[f.name] as string) || ""} onChange={(url) => set(f.name, url)} />
                  </div>
                ) : (
                  <label className="block text-sm font-medium">
                    {f.label}
                    {f.required && " *"}
                    {f.type === "textarea" ? (
                      <textarea rows={5} required={f.required} value={String(editing[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)} className={inputClass} />
                    ) : f.type === "combo" ? (
                      <ComboField field={f} value={String(editing[f.name] ?? "")} onChange={(v) => set(f.name, v)} />
                    ) : f.type === "select" ? (
                      <select required={f.required} value={String(editing[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)} className={inputClass}>
                        {f.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type === "tags" ? "text" : f.type}
                        placeholder={f.type === "url" ? "https://" : f.type === "tags" ? "Pisahkan dengan koma" : undefined}
                        required={f.required}
                        value={Array.isArray(editing[f.name]) ? (editing[f.name] as string[]).join(", ") : String(editing[f.name] ?? "")}
                        onChange={(e) => set(f.name, f.type === "number" && e.target.value !== "" ? Number(e.target.value) : e.target.value)}
                        className={inputClass}
                      />
                    )}
                  </label>
                )}
              </div>
            ))}
            <div className="flex flex-col gap-2 sm:flex-row md:col-span-2">
              <button type="submit" disabled={busy} className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
                {busy ? "Menyimpan..." : "Simpan"}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="rounded-full px-6 py-2.5 font-semibold text-slate-600 ring-1 ring-slate-300 hover:bg-slate-100">
                Batal
              </button>
            </div>
          </form>
          {Boolean(editing.id) && renderExtra?.(editing)}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                {columns.map((c) => (
                  <th key={c.name} className="px-4 py-3">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-slate-500">
                    Belum ada data.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={String(r.id)}>
                  {columns.map((c) => (
                    <td key={c.name} className="px-4 py-3">
                      {c.render ? c.render(r) : String(r[c.name] ?? "")}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button type="button" onClick={() => setEditing(r)} className="font-semibold text-ink hover:text-brand">
                      Edit
                    </button>
                    <button type="button" onClick={() => onDelete(r)} className="ml-4 font-semibold text-red-600 hover:underline">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
