/** Loading placeholder. Reserve the final dimensions via className to avoid layout shift. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`skeleton rounded-xl ${className}`} />
  );
}
