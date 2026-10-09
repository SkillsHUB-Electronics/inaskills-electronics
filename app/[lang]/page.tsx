import Hero from "@/components/home/Hero";
import AboutSection from "@/components/home/AboutSection";
import HighlightCard from "@/components/home/HighlightCard";
import LatestNews from "@/components/home/LatestNews";
import StatsCounter from "@/components/home/StatsCounter";
import HallOfFameHighlight from "@/components/home/HallOfFameHighlight";
import ExpertHighlight from "@/components/home/ExpertHighlight";
import LatestCompetitions from "@/components/home/LatestCompetitions";
import SponsorStrip from "@/components/home/SponsorStrip";
import CtaSponsor from "@/components/home/CtaSponsor";
import { getDictionary, isLocale, defaultLocale } from "@/lib/i18n";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(lang);

  return (
    <>
      <Hero lang={lang} dict={dict} />
      <HighlightCard lang={lang} dict={dict} />
      <AboutSection lang={lang} dict={dict} />
      <StatsCounter dict={dict} />
      <HallOfFameHighlight lang={lang} dict={dict} />
      <ExpertHighlight lang={lang} dict={dict} />
      <LatestCompetitions lang={lang} dict={dict} />
      <LatestNews lang={lang} dict={dict} />
      <SponsorStrip dict={dict} />
      <CtaSponsor lang={lang} dict={dict} />
    </>
  );
}
