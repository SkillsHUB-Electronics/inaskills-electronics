"use client";

import { getSiteContent } from "@/lib/queries";
import { useQuery } from "@/lib/useQuery";

// Nomor WA (format 62812...) dan email dikelola admin lewat site_content.
export function useContact() {
  const { data } = useQuery(getSiteContent, {});
  return {
    whatsapp: data.contact_whatsapp?.value_id || "",
    email: data.contact_email?.value_id || "",
  };
}
