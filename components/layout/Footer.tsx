import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import SocialLinks from "./SocialLinks";
import FooterContact from "./FooterContact";

export default function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const explore = [
    { href: `/${lang}/hall-of-fame/`, label: dict.nav.hallOfFame },
    { href: `/${lang}/kompetisi/`, label: dict.nav.competitions },
    { href: `/${lang}/proyek/`, label: dict.nav.projects },
    { href: `/${lang}/berita/`, label: dict.nav.news },
  ];
  const support = [
    { href: `/${lang}/sponsor/`, label: dict.nav.sponsor },
    { href: `/${lang}/login/`, label: dict.nav.login },
  ];

  return (
    <footer className="bg-ink px-4 text-white/70">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 py-12 text-sm md:grid-cols-4">
        <div className="col-span-2 space-y-4 md:col-span-1">
          <p className="text-base font-semibold text-white">
            Inaskills <span className="text-brand">Electronics</span>
          </p>
          <p>{dict.hero.eyebrow}</p>
          <SocialLinks label={dict.footer.follow} />
        </div>
        {[
          { title: dict.footerCols.explore, links: explore },
          { title: dict.footerCols.support, links: support },
        ].map((col) => (
          <nav key={col.title}>
            <p className="font-semibold text-white">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="col-span-2 md:col-span-1">
          <FooterContact title={dict.footerCols.contact} />
        </div>
      </div>
      <div className="mx-auto max-w-6xl border-t border-white/10 py-6 text-xs">
        © {new Date().getFullYear()} Inaskills Electronics. {dict.footer.rights}
      </div>
    </footer>
  );
}
