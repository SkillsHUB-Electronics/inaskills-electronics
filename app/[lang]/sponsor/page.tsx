import Section from "@/components/ui/Section";
import SponsorIntro from "@/components/sponsor/SponsorIntro";
import SponsorStrip from "@/components/home/SponsorStrip";
import ContactForm from "@/components/sponsor/ContactForm";
import ContactButtons from "@/components/sponsor/ContactButtons";
import { defaultLocale, getDictionary, isLocale } from "@/lib/i18n";

export default async function SponsorPage({ params }: PageProps<"/[lang]/sponsor">) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(lang);
  const t = dict.sponsorPage;

  return (
    <>
      <SponsorIntro lang={lang} dict={dict} />

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
