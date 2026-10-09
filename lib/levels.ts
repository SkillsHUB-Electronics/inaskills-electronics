export const levels = ["regional", "nasional", "asc", "wsa", "wsc"] as const;
export type Level = (typeof levels)[number];

// Urutan tampil Hall of Fame: tingkat internasional dulu (WSI, WSA, ASC), lalu Nasional & Regional.
// Singkatan tingkat lomba (enum "wsc" di database ditampilkan sebagai WSI / WorldSkills International).
export const levelShort: Record<Level, string> = { wsc: "WSI", wsa: "WSA", asc: "ASC", nasional: "Nasional", regional: "Regional" };

export const levelsByRank: Level[] = ["wsc", "wsa", "asc", "nasional", "regional"];
export const internationalLevels: Level[] = ["wsc", "wsa", "asc"];

export const levelColors: Record<Level, string> = {
  regional: "bg-slate-100 text-slate-700",
  nasional: "bg-red-100 text-red-700",
  asc: "bg-sky-100 text-sky-700",
  wsa: "bg-amber-100 text-amber-800",
  wsc: "bg-violet-100 text-violet-700",
};

// Medali yang masuk Hall of Fame, urut dari tertinggi.
export const hofMedals = ["gold", "silver", "bronze", "moe"] as const;
// Yang tampil di Hall of Fame: semua medali, ditambah "peserta" = peringkat tanpa medali.
export const hofTypes = [...hofMedals, "peserta"] as const;
