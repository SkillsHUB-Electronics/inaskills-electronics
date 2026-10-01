import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden bg-ink px-4 py-20 text-white sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#c8102e_0,transparent_40%),radial-gradient(circle_at_80%_60%,#1c2f4f_0,transparent_45%)]"
      />
      <div className="relative mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">{dict.hero.eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">{dict.hero.title}</h1>
        <p className="mt-5 max-w-2xl text-base text-white/80 sm:text-lg">{dict.hero.subtitle}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${lang}/sponsor/`}
            className="rounded-full bg-brand px-6 py-3 text-center font-semibold hover:bg-brand-dark"
          >
            {dict.hero.ctaPrimary}
          </Link>
          <Link
            href={`/${lang}/hall-of-fame/`}
            className="rounded-full border border-white/30 px-6 py-3 text-center font-semibold hover:bg-white/10"
          >
            {dict.hero.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
