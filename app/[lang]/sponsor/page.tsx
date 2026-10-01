import Section from "@/components/ui/Section";
import SponsorStrip from "@/components/home/SponsorStrip";
import ContactForm from "@/components/sponsor/ContactForm";
import ContactButtons from "@/components/sponsor/ContactButtons";
import { defaultLocale, getDictionary, isLocale } from "@/lib/i18n";

export default async function SponsorPage({ params }: PageProps<"/[lang]/sponsor">) {
  const { lang: raw } = await params;
  const dict = getDictionary(isLocale(raw) ? raw : defaultLocale);
  const t = dict.sponsorPage;

  return (
    <>
      <header className="bg-ink px-4 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h1 className="max-w-3xl text-3xl font-extrabold sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-2xl text-white/80">{t.subtitle}</p>
        </div>
      </header>

      <Section title={t.whyTitle}>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {t.why.map((w, i) => (
            <li key={i} className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <span className="text-2xl font-extrabold text-brand">0{i + 1}</span>
              <p className="mt-2 text-slate-700">{w}</p>
            </li>
          ))}
        </ul>
      </Section>

      <SponsorStrip dict={dict} />

      <Section title={t.formTitle}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          <div>
            <ContactButtons variant="dark" label={t.orContact} />
          </div>
        </div>
      </Section>
    </>
  );
}
