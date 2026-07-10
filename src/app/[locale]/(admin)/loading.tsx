import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
  return (
    <div
      className="space-y-6 max-w-6xl mx-auto py-8 px-4"
      aria-busy="true"
      aria-label="Loading admin panel"
    >
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-2 w-full">
          <Skeleton className="h-9 w-full max-w-64" />
          <Skeleton className="h-5 w-full max-w-96" />
        </div>
        <Skeleton className="h-11 w-full sm:w-36 rounded-lg shrink-0" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 bg-card rounded-xl border space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Content cards skeleton */}
      <div className="bg-card rounded-lg border space-y-4 p-4 md:p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
            <Skeleton className="h-5 w-3/4 max-w-xs" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 max-w-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
