"use client";

import { useEffect, useState } from "react";
import ExpertEditor from "@/components/admin/ExpertEditor";
import { inputClass } from "@/components/admin/CrudManager";
import { list, type Row } from "@/lib/mutations";
import { levelShort, type Level } from "@/lib/levels";

// Expert dikelola per kompetisi: pilih kompetisi, lalu tambah/hapus expert-nya.
export default function AdminExpertPage() {
  const [competitions, setCompetitions] = useState<Row[]>([]);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    list("competitions", "tahun", false)
      .then((rows) => {
        setCompetitions(rows);
        setSelected(String(rows[0]?.id ?? ""));
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Expert</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <label className="block max-w-xl text-sm font-medium">
        Kompetisi
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className={inputClass}>
          {competitions.map((c) => (
            <option key={String(c.id)} value={String(c.id)}>
              {String(c.nama_id)} · {levelShort[c.level as Level]} {String(c.tahun)}
            </option>
          ))}
        </select>
      </label>
      {competitions.length === 0 && !error && <p className="text-sm text-slate-500">Tambahkan kompetisi dulu di menu Kompetisi.</p>}
      {selected && <ExpertEditor key={selected} competitionId={selected} />}
    </div>
  );
}
