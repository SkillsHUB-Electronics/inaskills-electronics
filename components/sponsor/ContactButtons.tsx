"use client";

import { useContact } from "@/lib/useContact";
import { useLocale } from "@/lib/useLocale";

export default function ContactButtons({
  variant = "light",
  label,
}: {
  variant?: "light" | "dark";
  label?: string;
}) {
  const { dict } = useLocale();
  const { whatsapp, email } = useContact();
  const solid =
    variant === "light"
      ? "bg-white text-brand hover:bg-white/90"
      : "bg-brand text-white hover:bg-brand-dark";
  const outline =
    variant === "light"
      ? "border-white hover:bg-white/10"
      : "border-brand text-brand hover:bg-brand/5";

  if (!whatsapp && !email) return null;

  return (
    <div>
      {label && <p className="mb-3 font-semibold">{label}</p>}
      <div className="flex flex-col gap-3 sm:flex-row">
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(dict.cta.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded-full px-6 py-3 text-center font-semibold ${solid}`}
          >
            {dict.cta.whatsapp}
          </a>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className={`rounded-full border px-6 py-3 text-center font-semibold ${outline}`}
          >
            {dict.cta.email}
          </a>
        )}
      </div>
    </div>
  );
}
