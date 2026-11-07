export function CatalogSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr]" aria-busy="true" aria-label="Cargando catálogo">
      <div className="hidden space-y-4 lg:block">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-[4px] bg-soot" />
        ))}
      </div>
      <div>
        <div className="mb-6 h-11 animate-pulse rounded-[3px] bg-soot" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-[4px] bg-soot" />
          ))}
        </div>
      </div>
    </div>
  );
}
