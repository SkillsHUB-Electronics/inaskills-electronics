"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AlumniProfile from "@/components/alumni/AlumniProfile";
import Section from "@/components/ui/Section";
import { getAlumniBySlug } from "@/lib/queries";
import { useLocale } from "@/lib/useLocale";
import { useQuery } from "@/lib/useQuery";

function Profile({ slug }: { slug: string }) {
  const { dict } = useLocale();
  const { data, loading, error } = useQuery(() => getAlumniBySlug(slug), null);

  if (loading) return <Section><p className="text-slate-500">{dict.common.loading}</p></Section>;
  if (error) return <Section><p className="text-red-600">{dict.common.error}</p></Section>;
  if (!data) return <Section><p className="text-slate-500">{dict.common.notFound}</p></Section>;

  return <AlumniProfile data={data} />;
}

function WithSlug() {
  const slug = useSearchParams().get("slug") ?? "";
  return <Profile key={slug} slug={slug} />;
}

export default function AlumniPage() {
  return (
    <Suspense>
      <WithSlug />
    </Suspense>
  );
}
