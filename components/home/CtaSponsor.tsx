import Link from "next/link";
import ContactButtons from "@/components/sponsor/ContactButtons";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function CtaSponsor({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="bg-brand px-4 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">{dict.cta.title}</h2>
          <p className="mt-2 text-white/85">{dict.cta.subtitle}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${lang}/sponsor/`}
            className="rounded-full border border-white px-6 py-3 text-center font-semibold hover:bg-white/10"
          >
            {dict.cta.button}
          </Link>
          <ContactButtons />
        </div>
      </div>
    </section>
  );
}
