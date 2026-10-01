"use client";

import type { Dictionary } from "@/lib/i18n";
import { getSiteContent } from "@/lib/queries";
import { useQuery } from "@/lib/useQuery";

export default function CtaSponsor({ dict }: { dict: Dictionary }) {
  const { data } = useQuery(getSiteContent, {});
  // Nomor WA (format 62812...) dan email dikelola admin lewat site_content.
  const wa = data.contact_whatsapp?.value_id;
  const email = data.contact_email?.value_id;

  return (
    <section className="bg-brand px-4 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">{dict.cta.title}</h2>
          <p className="mt-2 text-white/85">{dict.cta.subtitle}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {wa && (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-6 py-3 text-center font-semibold text-brand hover:bg-white/90"
            >
              {dict.cta.whatsapp}
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="rounded-full border border-white px-6 py-3 text-center font-semibold hover:bg-white/10"
            >
              {dict.cta.email}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
