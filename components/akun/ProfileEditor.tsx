"use client";

import { useEffect, useState } from "react";
import { uploadFile } from "@/lib/mutations";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/lib/useLocale";
import { socialFields, type Profile } from "@/components/akun/profile";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

type Text = Omit<Profile, "keahlian"> & { keahlian: string };
const textFields = ["nama", "bio", "pekerjaan", "instansi", "lokasi", "quote_id", "quote_en", "linkedin_url", "github_url", "instagram_url"] as const;

// Jendela Edit Profil. Foto langsung tersimpan saat diunggah/dihapus; isian lain saat Simpan.
export default function ProfileEditor({
  profile,
  userId,
  email,
  onChange,
  onClose,
}: {
  profile: Profile;
  userId: string;
  email: string;
  onChange: (p: Partial<Profile>) => void;
  onClose: () => void;
}) {
  const { dict } = useLocale();
  const t = dict.account;
  const [draft, setDraft] = useState<Text>({ ...profile, keahlian: profile.keahlian.join(", ") });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const set = (k: keyof Text, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function update(row: Record<string, unknown>) {
    const { error } = (await supabase?.from("profiles").update(row).eq("id", userId)) ?? { error: null };
    if (error) setStatus(dict.auth.failed + error.message);
    return !error;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    // Isian kosong disimpan sebagai null; keahlian dipisah koma, tanpa duplikat.
    const keahlian = [...new Set(draft.keahlian.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 20);
    const row = Object.fromEntries(textFields.map((k) => [k, k === "nama" ? draft[k].trim() : draft[k].trim() || null]));
    if (await update({ ...row, keahlian })) {
      onChange({ ...Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v ?? ""])), keahlian, updated_at: new Date().toISOString() });
      onClose();
    }
    setSaving(false);
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setStatus("");
    try {
      const old = draft.foto_url;
      const url = await uploadFile("avatars", file, userId);
      if (await update({ foto_url: url })) {
        set("foto_url", url);
        onChange({ foto_url: url, updated_at: new Date().toISOString() });
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
    const old = draft.foto_url;
    if (await update({ foto_url: null })) {
      set("foto_url", "");
      onChange({ foto_url: "", updated_at: new Date().toISOString() });
      removeStored(old);
    }
  }

  // Hapus file lama di storage (best-effort; gagal pun tidak mengganggu).
  function removeStored(url: string) {
    const path = url.split("/storage/v1/object/public/avatars/")[1];
    if (path) supabase?.storage.from("avatars").remove([decodeURIComponent(path)]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center sm:p-4" onClick={onClose}>
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{t.editProfile}</h2>
          <button type="button" onClick={onClose} aria-label={t.close} className="rounded-full p-1 text-2xl leading-none text-slate-400 hover:text-ink">
            ×
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-4 ring-brand/15">
            {draft.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.foto_url} alt={draft.nama} className="h-full w-full object-cover" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-12 w-12 text-slate-300" fill="currentColor" aria-hidden="true">
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14z" />
              </svg>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <div className="flex flex-wrap justify-center gap-2">
              <label className="cursor-pointer rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-soft">
                {uploading ? t.uploading : draft.foto_url ? t.changePhoto : t.uploadPhoto}
                <input type="file" accept="image/*" onChange={onPhoto} disabled={uploading} className="hidden" />
              </label>
              {draft.foto_url && (
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
            <input value={draft.nama} onChange={(e) => set("nama", e.target.value)} className={input} />
            <span className="text-xs font-normal text-slate-500">{email}</span>
          </label>
          <label className="block text-sm font-medium">
            {t.job}
            <input placeholder={t.jobPlaceholder} value={draft.pekerjaan} onChange={(e) => set("pekerjaan", e.target.value)} className={input} />
          </label>
          <label className="block text-sm font-medium">
            {t.company}
            <input placeholder={t.companyPlaceholder} value={draft.instansi} onChange={(e) => set("instansi", e.target.value)} className={input} />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            {t.location}
            <input placeholder={t.locationPlaceholder} value={draft.lokasi} onChange={(e) => set("lokasi", e.target.value)} className={input} />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            {t.bio}
            <textarea rows={4} maxLength={1000} placeholder={t.bioPlaceholder} value={draft.bio} onChange={(e) => set("bio", e.target.value)} className={input} />
          </label>
          <label className="block text-sm font-medium">
            {t.quoteId}
            <input maxLength={160} placeholder={t.quotePlaceholderId} value={draft.quote_id} onChange={(e) => set("quote_id", e.target.value)} className={input} />
          </label>
          <label className="block text-sm font-medium">
            {t.quoteEn}
            <input maxLength={160} placeholder={t.quotePlaceholderEn} value={draft.quote_en} onChange={(e) => set("quote_en", e.target.value)} className={input} />
          </label>
          <p className="-mt-2 text-xs text-slate-500 sm:col-span-2">{t.quoteHint}</p>
          <label className="block text-sm font-medium sm:col-span-2">
            {t.skills}
            <input placeholder={t.skillsPlaceholder} value={draft.keahlian} onChange={(e) => set("keahlian", e.target.value)} className={input} />
            <span className="text-xs font-normal text-slate-500">{t.skillsHint}</span>
          </label>
        </div>

        <p className="mt-5 text-sm font-semibold">{t.social}</p>
        <p className="text-xs text-slate-500">{t.socialHint}</p>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
          {socialFields.map(({ key, label, placeholder }) => (
            <label key={key} className="mt-3 block text-sm font-medium">
              {label}
              <input type="url" placeholder={placeholder} value={draft[key]} onChange={(e) => set(key, e.target.value)} className={input} />
            </label>
          ))}
        </div>

        {status && <p className="mt-4 text-sm text-red-600">{status}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 font-semibold text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50">
            {t.cancel}
          </button>
          <button type="submit" disabled={saving} className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {t.save}
          </button>
        </div>
      </form>
    </div>
  );
}
