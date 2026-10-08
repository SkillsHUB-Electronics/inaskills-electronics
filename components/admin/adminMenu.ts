import type { AdminTexts } from "@/lib/adminLang";
import type { IconName } from "./AdminIcon";

export type MenuKey = keyof AdminTexts["menu"];

// Urutan menu sidebar admin. group "system" tampil di bawah garis pemisah.
export const adminMenu: { key: MenuKey; href: string; icon: IconName; group: "manage" | "system" }[] = [
  { key: "dashboard", href: "/admin/", icon: "dashboard", group: "manage" },
  { key: "alumni", href: "/admin/alumni/", icon: "alumni", group: "manage" },
  { key: "hof", href: "/admin/hall-of-fame/", icon: "hof", group: "manage" },
  { key: "kompetisi", href: "/admin/kompetisi/", icon: "kompetisi", group: "manage" },
  { key: "proyek", href: "/admin/proyek/", icon: "proyek", group: "manage" },
  { key: "berita", href: "/admin/berita/", icon: "berita", group: "manage" },
  { key: "sponsor", href: "/admin/sponsor/", icon: "sponsor", group: "manage" },
  { key: "konten", href: "/admin/konten/", icon: "konten", group: "manage" },
  { key: "pesan", href: "/admin/pesan/", icon: "pesan", group: "manage" },
  { key: "pengguna", href: "/admin/pengguna/", icon: "pengguna", group: "system" },
  { key: "akun", href: "/admin/akun/", icon: "akun", group: "system" },
];
