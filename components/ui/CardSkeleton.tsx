export default function CardSkeleton({ count, className = "h-28" }: { count: number; className?: string }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />
      ))}
    </>
  );
}
