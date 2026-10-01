"use client";

import { useState } from "react";
import Section from "@/components/ui/Section";
import CardSkeleton from "@/components/ui/CardSkeleton";
import ProjectCard from "@/components/proyek/ProjectCard";
import { getProjects } from "@/lib/queries";
import { useLocale } from "@/lib/useLocale";
import { useQuery } from "@/lib/useQuery";
import type { ProjectCategory } from "@/types/database";

const categories: (ProjectCategory | "all")[] = ["all", "rnd", "soal", "task_project", "lainnya"];

export default function ProjectsPage() {
  const { lang, dict } = useLocale();
  const t = dict.projects;
  const { data, loading, error } = useQuery(getProjects, []);
  const [cat, setCat] = useState<ProjectCategory | "all">("all");
  const list = data.filter((p) => cat === "all" || p.kategori === cat);

  return (
    <Section title={t.title} subtitle={t.subtitle}>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
              cat === c ? "bg-ink text-white ring-ink" : "bg-white text-slate-700 ring-slate-300 hover:ring-ink"
            }`}
          >
            {c === "all" ? dict.common.all : t.categories[c]}
          </button>
        ))}
      </div>
      {error && <p className="mt-6 text-red-600">{dict.common.error}</p>}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? <CardSkeleton count={3} className="h-56" /> : list.map((p) => <ProjectCard key={p.id} p={p} lang={lang} dict={dict} />)}
      </div>
      {!loading && list.length === 0 && <p className="text-slate-500">{t.empty}</p>}
    </Section>
  );
}
