"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { useSession } from "@/lib/useSession";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const [open, setOpen] = useState(false);
  const { session } = useSession();
  const account = session
    ? { href: `/${lang}/akun/`, label: dict.nav.account }
    : { href: `/${lang}/login/`, label: dict.nav.login };
  const links = [
    { href: `/${lang}/`, label: dict.nav.home },
    { href: `/${lang}/hall-of-fame/`, label: dict.nav.hallOfFame },
    { href: `/${lang}/kompetisi/`, label: dict.nav.competitions },
    { href: `/${lang}/proyek/`, label: dict.nav.projects },
    { href: `/${lang}/berita/`, label: dict.nav.news },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 px-4 text-white backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between">
        <Link href={`/${lang}/`} className="text-lg font-bold tracking-tight">
          Inaskills <span className="text-brand">Electronics</span>
        </Link>

        <div className="hidden items-center gap-5 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-white/80 hover:text-white">
              {l.label}
            </Link>
          ))}
          <LanguageSwitcher lang={lang} />
          <Link href={account.href} className="text-sm font-semibold text-white hover:text-white/80">
            {account.label}
          </Link>
          <Link
            href={`/${lang}/sponsor/`}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold hover:bg-brand-dark"
          >
            {dict.nav.sponsor}
          </Link>
        </div>

        <button
          type="button"
          className="rounded p-2 lg:hidden"
          aria-label={dict.nav.menu}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 pb-4 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-white/90"
            >
              {l.label}
            </Link>
          ))}
          <Link href={account.href} onClick={() => setOpen(false)} className="block py-3 font-semibold text-white">
            {account.label}
          </Link>
          <div className="flex items-center justify-between pt-2">
            <LanguageSwitcher lang={lang} />
            <Link
              href={`/${lang}/sponsor/`}
              onClick={() => setOpen(false)}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold"
            >
              {dict.nav.sponsor}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
