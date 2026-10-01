"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  // Ganti segmen bahasa pertama, pertahankan sisa path.
  const swap = (target: Locale) => pathname.replace(/^\/(id|en)(?=\/|$)/, `/${target}`);

  return (
    <div className="flex overflow-hidden rounded-full border border-white/20 text-xs font-semibold">
      {locales.map((l) => (
        <Link
          key={l}
          href={swap(l)}
          className={`px-3 py-1.5 uppercase ${l === lang ? "bg-white text-ink" : "text-white/70 hover:text-white"}`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
