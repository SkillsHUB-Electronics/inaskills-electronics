export default function Section({
  id,
  title,
  subtitle,
  className = "",
  children,
}: {
  id?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`px-4 py-14 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {title && <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>}
        {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
        <div className={title ? "mt-8" : ""}>{children}</div>
      </div>
    </section>
  );
}
