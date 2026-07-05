import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div
      className="space-y-6 max-w-4xl"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 bg-card rounded-xl border space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="bg-card rounded-xl border divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-5 flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
