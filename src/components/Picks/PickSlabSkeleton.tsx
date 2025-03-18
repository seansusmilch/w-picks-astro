export function PickSlabSkeleton() {
  return (
    <div className='border-2 border-primary-foreground/10 shadow-lg rounded-lg p-2 flex gap-2 animate-in fade-in-0 duration-500'>
      <div className='flex flex-col justify-between'>
        {/* Avatar skeleton */}
        <div className='w-10 h-10 rounded-full bg-muted animate-pulse' />
        {/* Time skeleton */}
        <div className='w-8 h-3 bg-muted rounded animate-pulse' />
      </div>

      <div className='grow flex flex-col gap-2'>
        <div className='flex items-center gap-2 justify-between'>
          {/* Username skeleton */}
          <div className='w-20 h-4 bg-muted rounded animate-pulse' />
          {/* Team badge skeleton */}
          <div className='flex items-center rounded-lg bg-muted/50 animate-pulse'>
            <div className='w-6 h-6 rounded-full bg-muted' />
            <div className='w-12 h-6 rounded-r-lg' />
          </div>
        </div>

        <div className='flex'>
          {/* Comment skeleton */}
          <div className='grow flex flex-col gap-2'>
            <div className='w-full h-4 bg-muted rounded animate-pulse' />
            <div className='w-3/4 h-4 bg-muted rounded animate-pulse' />
          </div>
          {/* Like button skeleton */}
          <div className='pt-2'>
            <div className='min-h-12 flex flex-col items-center gap-2'>
              <div className='w-4 h-4 rounded bg-muted animate-pulse' />
              <div className='w-4 h-4 rounded bg-muted animate-pulse' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Optional: Create an array version for loading multiple skeletons
export function PickSlabSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className='flex flex-col gap-4'>
      {Array.from({ length: count }, (_, i) => (
        <PickSlabSkeleton key={i} />
      ))}
    </div>
  );
}
