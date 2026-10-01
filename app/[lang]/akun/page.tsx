"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Section from "@/components/ui/Section";
import { isAdmin, signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/lib/useLocale";
import { useSession } from "@/lib/useSession";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default function AccountPage() {
  const router = useRouter();
  const { lang, dict } = useLocale();
  const t = dict.account;
  const { session, loading } = useSession();
  const [nama, setNama] = useState("");
  const [admin, setAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!loading && !session) router.replace(`/${lang}/login/`);
  }, [loading, session, router, lang]);

  useEffect(() => {
    if (!session || !supabase) return;
    isAdmin().then(setAdmin);
    supabase
      .from("profiles")
      .select("nama")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setNama(data?.nama ?? ""));
  }, [session]);

  if (loading || !session) return <Section><p className="text-slate-500">{dict.common.loading}</p></Section>;

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const { error } = (await supabase?.from("profiles").update({ nama }).eq("id", session!.user.id)) ?? { error: null };
    setStatus(error ? dict.auth.failed + error.message : t.saved);
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
    <Section title={t.title} subtitle={`${t.hello}, ${nama || session.user.email}`}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-ink p-6 text-white lg:col-span-2">
          <h2 className="text-lg font-bold">{t.comingTitle}</h2>
          <p className="mt-2 text-white/80">{t.comingText}</p>
          {admin && (
            <Link href="/admin/" className="mt-5 inline-block rounded-full bg-brand px-5 py-2.5 font-semibold hover:bg-brand-dark">
              {t.toAdmin}
            </Link>
          )}
        </div>

        <div className="space-y-6">
          <form onSubmit={saveProfile} className="rounded-2xl p-5 ring-1 ring-slate-200">
            <h2 className="font-bold">{t.profile}</h2>
            <label className="mt-3 block text-sm font-medium">
              {dict.auth.name}
              <input value={nama} onChange={(e) => setNama(e.target.value)} className={input} />
            </label>
            <p className="mt-2 text-sm text-slate-500">{session.user.email}</p>
            <button type="submit" className="mt-3 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-ink-soft">
              {t.save}
            </button>
          </form>

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

          {status && <p className="text-sm text-slate-600">{status}</p>}
          <button type="button" onClick={logout} className="text-sm font-semibold text-red-600 hover:underline">
            {dict.nav.logout}
          </button>
        </div>
      </div>
    </Section>
  );
}
