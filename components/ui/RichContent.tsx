"use client";

import DOMPurify from "dompurify";
import { toHtml } from "@/lib/richtext";

// Link keluar di isi berita dibuka di tab baru.
if (typeof window !== "undefined") {
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A" && /^https?:/i.test(node.getAttribute("href") ?? "")) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
}

// Tampilkan isi berita (HTML dari editor) setelah dibersihkan dari script/atribut berbahaya.
export default function RichContent({ html, className = "" }: { html: string; className?: string }) {
  if (typeof window === "undefined") return null;
  return <div className={`rich-content ${className}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(toHtml(html)) }} />;
}
