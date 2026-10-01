"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAdmin, sendPasswordReset, signIn, signUp } from "@/lib/auth";
import { useLocale } from "@/lib/useLocale";

type Mode = "login" | "register" | "forgot";

const input =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default function LoginPage() {
  const router = useRouter();
  const { lang, dict } = useLocale();
  const t = dict.auth;
  const [mode, setMode] = useState<Mode>("login");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function switchMode(m: Mode) {
    setMode(m);
    setMessage(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "login") {
        await signIn(email, password);
        // Satu pintu masuk: admin ke panel admin, user biasa ke halaman akun.
        router.replace((await isAdmin()) ? "/admin/" : `/${lang}/akun/`);
        return;
      }
      if (mode === "register") {
        const { needsConfirmation } = await signUp(nama, email, password, lang);
        if (needsConfirmation) {
          setMessage({ ok: true, text: t.confirmEmail });
          setMode("login");
        } else {
          router.replace(`/${lang}/akun/`);
        }
        return;
      }
      await sendPasswordReset(email, lang);
      setMessage({ ok: true, text: t.resetSent });
    } catch (err) {
      const msg = (err as Error).message;
      setMessage({ ok: false, text: mode === "login" && /invalid/i.test(msg) ? t.wrong : t.failed + msg });
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "register" ? t.registerTitle : mode === "forgot" ? t.forgot : t.loginTitle;

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-14">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <h1 className="text-2xl font-bold">{title}</h1>

        {mode === "register" && (
          <label className="mt-6 block text-sm font-medium">
            {t.name}
            <input required value={nama} onChange={(e) => setNama(e.target.value)} autoComplete="name" className={input} />
          </label>
        )}
        <label className={`${mode === "register" ? "mt-4" : "mt-6"} block text-sm font-medium`}>
          {t.email}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} />
        </label>
        {mode !== "forgot" && (
          <label className="mt-4 block text-sm font-medium">
            {t.password}
            <input
              type="password"
              required
              minLength={mode === "register" ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              className={input}
            />
            {mode === "register" && <span className="mt-1 block text-xs font-normal text-slate-500">{t.passwordHint}</span>}
          </label>
        )}

        {message && <p className={`mt-4 text-sm ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</p>}

        <button type="submit" disabled={busy} className="mt-6 w-full rounded-full bg-brand py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          {busy ? t.busy : mode === "register" ? t.register : mode === "forgot" ? t.sendReset : t.login}
        </button>

        <div className="mt-6 space-y-2 text-center text-sm text-slate-600">
          {mode === "login" && (
            <>
              <button type="button" onClick={() => switchMode("forgot")} className="font-semibold text-ink hover:text-brand">
                {t.forgot}
              </button>
              <p>
                {t.noAccount}{" "}
                <button type="button" onClick={() => switchMode("register")} className="font-semibold text-brand hover:underline">
                  {t.register}
                </button>
              </p>
            </>
          )}
          {mode === "register" && (
            <p>
              {t.haveAccount}{" "}
              <button type="button" onClick={() => switchMode("login")} className="font-semibold text-brand hover:underline">
                {t.login}
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <button type="button" onClick={() => switchMode("login")} className="font-semibold text-brand hover:underline">
              {t.backToLogin}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
