export function RouteSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 md:px-8" aria-busy="true" aria-label="Cargando">
      <div className="mb-8 h-16 w-2/3 animate-pulse rounded-[4px] bg-soot" />
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="aspect-video animate-pulse rounded-[4px] bg-soot" />
        <div className="h-80 animate-pulse rounded-[4px] bg-soot" />
      </div>
    </div>
  );
}
