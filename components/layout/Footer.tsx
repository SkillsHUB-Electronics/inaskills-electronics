import type { Dictionary } from "@/lib/i18n";

export default function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="bg-ink px-4 text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-white">
          Inaskills <span className="text-brand">Electronics</span>
        </p>
        <p>
          © {new Date().getFullYear()} Inaskills Electronics. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
