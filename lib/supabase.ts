import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// null saat env belum diisi, supaya halaman tetap bisa dibangun dengan data contoh.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
