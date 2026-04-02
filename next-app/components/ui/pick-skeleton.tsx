export function PickSlabSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3 animate-pulse">
      <div className="shrink-0">
        <div className="w-10 h-10 rounded-full bg-muted" />
      </div>
      <div className="grow min-w-0 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-20 h-4 bg-muted rounded" />
          <div className="w-8 h-3 bg-muted rounded" />
        </div>
        <div className="w-full h-4 bg-muted rounded" />
        <div className="w-3/4 h-4 bg-muted rounded" />
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            <div className="w-20 h-3 bg-muted rounded" />
            <div className="flex items-center rounded-full bg-muted/50 h-5 gap-1">
              <div className="w-5 h-5 rounded-full bg-muted" />
              <div className="w-10 h-4 rounded-r-full" />
            </div>
          </div>
          <div className="w-10 h-6 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
