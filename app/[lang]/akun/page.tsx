"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Section from "@/components/ui/Section";
import { isAdmin, signOut } from "@/lib/auth";
import { uploadFile } from "@/lib/mutations";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/lib/useLocale";
import { useSession } from "@/lib/useSession";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

const emptyProfile = {
  nama: "",
  foto_url: "",
  bio: "",
  pekerjaan: "",
  instansi: "",
  linkedin_url: "",
  github_url: "",
  instagram_url: "",
};
type Profile = typeof emptyProfile;

export default function AccountPage() {
  const router = useRouter();
  const { lang, dict } = useLocale();
  const t = dict.account;
  const { session, loading } = useSession();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [admin, setAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!loading && !session) router.replace(`/${lang}/login/`);
  }, [loading, session, router, lang]);

  useEffect(() => {
    if (!session || !supabase) return;
    isAdmin().then(setAdmin);
    supabase
      .from("profiles")
      .select(Object.keys(emptyProfile).join(", "))
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        const row = (data ?? {}) as Record<string, string | null>;
        setProfile(Object.fromEntries(Object.keys(emptyProfile).map((k) => [k, row[k] ?? ""])) as Profile);
      });
  }, [session]);

  if (loading || !session) return <Section><p className="text-slate-500">{dict.common.loading}</p></Section>;
  const userId = session.user.id;
  const set = (k: keyof Profile, v: string) => setProfile((p) => ({ ...p, [k]: v }));

  async function update(row: Partial<Record<keyof Profile, string | null>>) {
    const { error } = (await supabase?.from("profiles").update(row).eq("id", userId)) ?? { error: null };
    setStatus(error ? dict.auth.failed + error.message : t.saved);
    return !error;
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    // Isian kosong disimpan sebagai null.
    update(Object.fromEntries(Object.entries(profile).map(([k, v]) => [k, k === "nama" ? v.trim() : v.trim() || null])));
  }

  // Foto langsung tersimpan saat diunggah/dihapus, tanpa menekan Simpan.
  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setStatus("");
    try {
      const old = profile.foto_url;
      const url = await uploadFile("avatars", file, userId);
      if (await update({ foto_url: url })) {
        set("foto_url", url);
        if (old) removeStored(old);
      }
    } catch (err) {
      setStatus(dict.auth.failed + (err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function deletePhoto() {
    if (!confirm(t.deletePhotoConfirm)) return;
    const old = profile.foto_url;
    if (await update({ foto_url: null })) {
      set("foto_url", "");
      removeStored(old);
    }
  }

  // Hapus file lama di storage (best-effort; gagal pun tidak mengganggu).
  function removeStored(url: string) {
    const path = url.split("/storage/v1/object/public/avatars/")[1];
    if (path) supabase?.storage.from("avatars").remove([decodeURIComponent(path)]);
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    const { error } = (await supabase?.auth.updateUser({ password })) ?? { error: null };
    setPassword("");
    setStatus(error ? dict.auth.failed + error.message : t.saved);
  }

  async function logout() {
    await signOut();
    router.replace(`/${lang}/`);
  }

  return (
    <Section title={t.title} subtitle={`${t.hello}, ${profile.nama || session.user.email}`}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={saveProfile} className="rounded-2xl p-5 ring-1 ring-slate-200 sm:p-6 lg:col-span-2">
          <h2 className="text-lg font-bold">{t.profile}</h2>

          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-4 ring-brand/15">
              {profile.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.foto_url} alt={profile.nama} className="h-full w-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-14 w-14 text-slate-300" fill="currentColor" aria-hidden="true">
                  <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z" />
                </svg>
              )}
            </div>
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <div className="flex flex-wrap justify-center gap-2">
                <label className="cursor-pointer rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-soft">
                  {uploading ? t.uploading : profile.foto_url ? t.changePhoto : t.uploadPhoto}
                  <input type="file" accept="image/*" onChange={onPhoto} disabled={uploading} className="hidden" />
                </label>
                {profile.foto_url && (
                  <button type="button" onClick={deletePhoto} className="rounded-full px-4 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-50">
                    {t.deletePhoto}
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500">{t.photoHint}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium sm:col-span-2">
              {dict.auth.name}
              <input value={profile.nama} onChange={(e) => set("nama", e.target.value)} className={input} />
              <span className="text-xs font-normal text-slate-500">{session.user.email}</span>
            </label>
            <label className="block text-sm font-medium">
              {t.job}
              <input placeholder={t.jobPlaceholder} value={profile.pekerjaan} onChange={(e) => set("pekerjaan", e.target.value)} className={input} />
            </label>
            <label className="block text-sm font-medium">
              {t.company}
              <input placeholder={t.companyPlaceholder} value={profile.instansi} onChange={(e) => set("instansi", e.target.value)} className={input} />
            </label>
            <label className="block text-sm font-medium sm:col-span-2">
              {t.bio}
              <textarea rows={4} maxLength={1000} placeholder={t.bioPlaceholder} value={profile.bio} onChange={(e) => set("bio", e.target.value)} className={input} />
            </label>
          </div>

          <p className="mt-5 text-sm font-semibold">{t.social}</p>
          <p className="text-xs text-slate-500">{t.socialHint}</p>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
            {(
              [
                ["linkedin_url", "LinkedIn", "https://linkedin.com/in/..."],
                ["github_url", "GitHub", "https://github.com/..."],
                ["instagram_url", "Instagram", "https://instagram.com/..."],
              ] as const
            ).map(([key, label, ph]) => (
              <label key={key} className="mt-3 block text-sm font-medium">
                {label}
                <input type="url" placeholder={ph} value={profile[key]} onChange={(e) => set(key, e.target.value)} className={input} />
              </label>
            ))}
          </div>

          <button type="submit" className="mt-5 rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-dark">
            {t.save}
          </button>
          {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
        </form>

        <div className="space-y-6">
          <div className="rounded-2xl bg-ink p-6 text-white">
            <h2 className="text-lg font-bold">{t.comingTitle}</h2>
            <p className="mt-2 text-white/80">{t.comingText}</p>
            {admin && (
              <Link href="/admin/" className="mt-5 inline-block rounded-full bg-brand px-5 py-2.5 font-semibold hover:bg-brand-dark">
                {t.toAdmin}
              </Link>
            )}
          </div>

          <form onSubmit={savePassword} className="rounded-2xl p-5 ring-1 ring-slate-200">
            <h2 className="font-bold">{t.changePassword}</h2>
            <label className="mt-3 block text-sm font-medium">
              {t.newPassword}
              <input type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className={input} />
            </label>
            <button type="submit" className="mt-3 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink-soft">
              {t.save}
            </button>
          </form>

          <button type="button" onClick={logout} className="text-sm font-semibold text-red-600 hover:underline">
            {dict.nav.logout}
          </button>
        </div>
      </div>
    </Section>
  );
}
