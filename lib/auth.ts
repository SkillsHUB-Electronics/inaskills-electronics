import { supabase } from "@/lib/supabase";

function client() {
  if (!supabase) throw new Error("Supabase belum dikonfigurasi");
  return supabase;
}

// Alamat situs saat ini (termasuk basePath GitHub Pages) untuk link di email Supabase.
function siteUrl(path: string) {
  return `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
}

export async function isAdmin(): Promise<boolean> {
  const { data, error } = await client().rpc("is_admin");
  if (error) return false;
  return data === true;
}

export async function signIn(email: string, password: string) {
  const { error } = await client().auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(nama: string, email: string, password: string, lang: string) {
  const { data, error } = await client().auth.signUp({
    email,
    password,
    options: { data: { nama }, emailRedirectTo: siteUrl(`/${lang}/akun/`) },
  });
  if (error) throw error;
  // Tanpa session berarti Supabase meminta konfirmasi email dulu.
  return { needsConfirmation: !data.session };
}

export async function sendPasswordReset(email: string, lang: string) {
  const { error } = await client().auth.resetPasswordForEmail(email, { redirectTo: siteUrl(`/${lang}/akun/`) });
  if (error) throw error;
}

export async function signOut() {
  await supabase?.auth.signOut();
}
