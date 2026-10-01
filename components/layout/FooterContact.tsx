"use client";

import { useContact } from "@/lib/useContact";

export default function FooterContact({ title }: { title: string }) {
  const { whatsapp, email } = useContact();
  if (!whatsapp && !email) return null;
  return (
    <>
      <p className="font-semibold text-white">{title}</p>
      <ul className="mt-3 space-y-2 break-all">
        {whatsapp && (
          <li>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              WhatsApp +{whatsapp}
            </a>
          </li>
        )}
        {email && (
          <li>
            <a href={`mailto:${email}`} className="hover:text-white">
              {email}
            </a>
          </li>
        )}
      </ul>
    </>
  );
}
