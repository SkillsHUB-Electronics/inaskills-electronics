"use client";

import { useState } from "react";
import { sendContactMessage } from "@/lib/queries";
import { useLocale } from "@/lib/useLocale";

const empty = { nama: "", perusahaan: "", email: "", telepon: "", pesan: "" };

export default function ContactForm() {
  const { dict } = useLocale();
  const t = dict.sponsorPage;
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await sendContactMessage(form);
      setForm(empty);
      setStatus("sent");
    } catch {
      setStatus("failed");
    }
  }

  const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium">
        {t.name} *
        <input required value={form.nama} onChange={set("nama")} className={input} />
      </label>
      <label className="text-sm font-medium">
        {t.company}
        <input value={form.perusahaan} onChange={set("perusahaan")} className={input} />
      </label>
      <label className="text-sm font-medium">
        {t.email} *
        <input required type="email" value={form.email} onChange={set("email")} className={input} />
      </label>
      <label className="text-sm font-medium">
        {t.phone}
        <input type="tel" value={form.telepon} onChange={set("telepon")} className={input} />
      </label>
      <label className="text-sm font-medium sm:col-span-2">
        {t.message} *
        <textarea required rows={5} value={form.pesan} onChange={set("pesan")} className={input} />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-60 sm:w-auto"
        >
          {status === "sending" ? t.sending : t.send}
        </button>
        {status === "sent" && <p className="mt-3 text-green-700">{t.sent}</p>}
        {status === "failed" && <p className="mt-3 text-red-600">{t.failed}</p>}
      </div>
    </form>
  );
}
