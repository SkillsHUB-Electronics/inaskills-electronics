import { supabase } from "@/lib/supabase";

// Pesan dianggap "belum dibaca" bila masuk setelah admin terakhir membuka halaman Pesan Masuk
// (disimpan per browser, tanpa kolom baru di database).
const KEY = "admin_messages_seen_at";

export function markMessagesSeen() {
  try {
    localStorage.setItem(KEY, new Date().toISOString());
  } catch {}
}

function seenAt(): string {
  try {
    return localStorage.getItem(KEY) ?? "1970-01-01T00:00:00Z";
  } catch {
    return "1970-01-01T00:00:00Z";
  }
}

export async function countUnreadMessages(): Promise<number> {
  if (!supabase) return 0;
  const { count } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .gt("created_at", seenAt());
  return count ?? 0;
}
