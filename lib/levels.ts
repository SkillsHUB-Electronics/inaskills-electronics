export const levels = ["regional", "nasional", "asc", "wsa", "wsc"] as const;
export type Level = (typeof levels)[number];

export const levelColors: Record<Level, string> = {
  regional: "bg-slate-100 text-slate-700",
  nasional: "bg-red-100 text-red-700",
  asc: "bg-sky-100 text-sky-700",
  wsa: "bg-amber-100 text-amber-800",
  wsc: "bg-violet-100 text-violet-700",
};
