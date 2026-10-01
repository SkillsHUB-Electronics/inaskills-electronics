"use client";

import { getSiteContent } from "@/lib/queries";
import { socialPlatforms } from "@/lib/social";
import { useQuery } from "@/lib/useQuery";

export default function SocialLinks({ label }: { label: string }) {
  const { data } = useQuery(getSiteContent, {});
  const links = socialPlatforms.filter((p) => data[p.key]?.value_id);
  if (links.length === 0) return null;

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-white/50">{label}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {links.map((p) => (
          <li key={p.key}>
            <a
              href={data[p.key].value_id}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:border-white hover:text-white"
            >
              {p.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
