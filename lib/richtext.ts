// Isi lama berupa teks biasa diubah jadi HTML sederhana (paragraf dipisah baris kosong).
export function toHtml(text: string): string {
  if (!text) return "";
  if (/<\/?(p|h[1-6]|ul|ol|li|blockquote|img|a|strong|em|br)\b/i.test(text)) return text;
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}
