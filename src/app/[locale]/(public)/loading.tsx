import { Skeleton } from '@/components/ui/skeleton'

export default function PublicLoading() {
  return (
    <div className="min-h-screen" aria-busy="true" aria-label="Loading page content">
      {/* Hero skeleton */}
      <div className="h-[60vh] bg-muted/30 animate-pulse" />

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
