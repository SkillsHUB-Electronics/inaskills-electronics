import Link from "next/link";
import SiteText from "@/components/ui/SiteText";
import ContactButtons from "@/components/sponsor/ContactButtons";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function CtaSponsor({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="bg-brand px-4 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl"><SiteText k="cta_title" lang={lang} fallback={dict.cta.title} /></h2>
          <p className="mt-2 text-white/85"><SiteText k="cta_subtitle" lang={lang} fallback={dict.cta.subtitle} /></p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${lang}/sponsor/`}
            className="rounded-full border border-white px-6 py-3 text-center font-semibold hover:bg-white/10"
          >
            <SiteText k="cta_button" lang={lang} fallback={dict.cta.button} />
          </Link>
          <ContactButtons />
        </div>
      </div>
    </section>
  );
}
