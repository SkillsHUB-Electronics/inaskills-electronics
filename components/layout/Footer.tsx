import type { Dictionary } from "@/lib/i18n";
import SocialLinks from "./SocialLinks";

export default function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="bg-ink px-4 text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 py-8 text-sm sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <p className="font-semibold text-white">
            Inaskills <span className="text-brand">Electronics</span>
          </p>
          <SocialLinks label={dict.footer.follow} />
        </div>
        <p>
          © {new Date().getFullYear()} Inaskills Electronics. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
