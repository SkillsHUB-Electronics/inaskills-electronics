"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n";

// Teks kerangka panel admin (sidebar, topbar, dashboard). Halaman CRUD lain tetap berbahasa Indonesia.
const texts = {
  id: {
    menu: {
      dashboard: "Dashboard",
      alumni: "Alumni",
      expert: "Expert",
      hof: "Hall of Fame",
      kompetisi: "Kompetisi",
      proyek: "Proyek & Riset",
      berita: "Berita",
      sponsor: "Sponsor",
      konten: "Konten & Kontak",
      pesan: "Pesan Masuk",
      pengguna: "Pengguna",
      akun: "Akun",
    },
    groupManage: "Kelola",
    groupSystem: "Sistem",
    viewSite: "Lihat situs",
    logout: "Keluar",
    loading: "Memuat...",
    administrator: "Administrator",
    search: "Cari alumni, kompetisi, berita, atau menu...",
    searchEmpty: "Tidak ada hasil",
    newMessages: "pesan baru",
    welcomeBack: (name: string) => `Selamat datang kembali, ${name}. Berikut ringkasan data terbaru dari INASKILLS Electronics.`,
    stats: { alumni: "Alumni", kompetisi: "Kompetisi", sponsor: "Sponsor", pesan: "Pesan masuk" },
    thisYear: (n: number) => `+${n} tahun ini`,
    activeSponsors: (n: number) => `${n} aktif`,
    unread: (n: number) => (n ? `${n} belum dibaca` : "Semua sudah dibaca"),
    welcome: "Selamat Datang,",
    quote: "“Bersama kita membangun talenta elektronik Indonesia untuk dunia.”",
    quickActions: "Aksi Cepat",
    qa: { alumni: "Tambah Alumni", kompetisi: "Tambah Kompetisi", berita: "Kelola Berita", sponsor: "Kelola Sponsor" },
    latestCompetitions: "Kompetisi Terbaru",
    seeAll: "Lihat semua",
    participants: (n: number) => `${n} peserta`,
    noCompetitions: "Belum ada kompetisi.",
    activity: "Aktivitas Terbaru",
    noActivity: "Belum ada aktivitas.",
    act: {
      alumni: "Alumni baru ditambahkan",
      competition: "Kompetisi baru dibuat",
      result: "Hasil HoF baru",
      news: "Berita ditambahkan",
      project: "Proyek ditambahkan",
      message: "Pesan masuk",
    },
    medalDist: "Distribusi Medali",
    totalMedals: "Total Medali",
    medals: { gold: "Emas", silver: "Perak", bronze: "Perunggu", moe: "MoE" },
    noMedals: "Belum ada data medali.",
    performance: "Performa Internasional",
    seeDetail: "Lihat detail",
    year: "Tahun",
    event: "Ajang",
    medal: "Medali",
    team: "Peserta",
    nasional: "Nasional",
  },
  en: {
    menu: {
      dashboard: "Dashboard",
      alumni: "Alumni",
      expert: "Experts",
      hof: "Hall of Fame",
      kompetisi: "Competitions",
      proyek: "Projects & Research",
      berita: "News",
      sponsor: "Sponsors",
      konten: "Content & Contact",
      pesan: "Inbox",
      pengguna: "Users",
      akun: "Account",
    },
    groupManage: "Manage",
    groupSystem: "System",
    viewSite: "View site",
    logout: "Log out",
    loading: "Loading...",
    administrator: "Administrator",
    search: "Search alumni, competitions, news, or menu...",
    searchEmpty: "No results",
    newMessages: "new messages",
    welcomeBack: (name: string) => `Welcome back, ${name}. Here is the latest summary from INASKILLS Electronics.`,
    stats: { alumni: "Alumni", kompetisi: "Competitions", sponsor: "Sponsors", pesan: "Messages" },
    thisYear: (n: number) => `+${n} this year`,
    activeSponsors: (n: number) => `${n} active`,
    unread: (n: number) => (n ? `${n} unread` : "All read"),
    welcome: "Welcome,",
    quote: "“Together we build Indonesia's electronics talent for the world.”",
    quickActions: "Quick Actions",
    qa: { alumni: "Add Alumni", kompetisi: "Add Competition", berita: "Manage News", sponsor: "Manage Sponsors" },
    latestCompetitions: "Latest Competitions",
    seeAll: "See all",
    participants: (n: number) => `${n} ${n === 1 ? "participant" : "participants"}`,
    noCompetitions: "No competitions yet.",
    activity: "Recent Activity",
    noActivity: "No activity yet.",
    act: {
      alumni: "New alumni added",
      competition: "New competition created",
      result: "New HoF result",
      news: "News added",
      project: "Project added",
      message: "New message",
    },
    medalDist: "Medal Distribution",
    totalMedals: "Total Medals",
    medals: { gold: "Gold", silver: "Silver", bronze: "Bronze", moe: "MoE" },
    noMedals: "No medal data yet.",
    performance: "International Performance",
    seeDetail: "See detail",
    year: "Year",
    event: "Event",
    medal: "Medals",
    team: "Team",
    nasional: "National",
  },
};

export type AdminTexts = (typeof texts)["id"];

const AdminLangContext = createContext<{ lang: Locale; t: AdminTexts; setLang: (l: Locale) => void }>({
  lang: "id",
  t: texts.id,
  setLang: () => {},
});

const KEY = "admin_lang";
const listeners = new Set<() => void>();

// Pilihan bahasa disimpan di localStorage; useSyncExternalStore menjaga hasil prerender tetap "id".
function readLang(): Locale {
  try {
    return localStorage.getItem(KEY) === "en" ? "en" : "id";
  } catch {
    return "id";
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function AdminLangProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLang, () => "id" as Locale);

  function setLang(l: Locale) {
    try {
      localStorage.setItem(KEY, l);
    } catch {}
    listeners.forEach((fn) => fn());
  }

  return <AdminLangContext.Provider value={{ lang, t: texts[lang] as AdminTexts, setLang }}>{children}</AdminLangContext.Provider>;
}

export function useAdminLang() {
  return useContext(AdminLangContext);
}
