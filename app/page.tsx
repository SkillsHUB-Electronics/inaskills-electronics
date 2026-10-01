"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";

// Static export tidak punya server redirect, jadi arahkan dari browser.
export default function RootRedirect() {
  const router = useRouter();
  useEffect(() => {
    const preferred = navigator.language?.toLowerCase().startsWith("id") ? "id" : "en";
    router.replace(`/${preferred || defaultLocale}/`);
  }, [router]);
  return null;
}
