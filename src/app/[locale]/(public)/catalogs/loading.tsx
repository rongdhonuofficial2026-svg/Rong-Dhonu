import { BookOpen, Search, Filter, ArrowUpDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function CatalogsLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section Skeleton */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-muted/20">
        <div className="container relative z-10 mx-auto px-4 max-w-5xl text-center flex flex-col items-center">
          <Skeleton className="h-7 w-32 rounded-full mb-6" />
          <Skeleton className="h-16 w-3/4 max-w-2xl mb-6" />
          <Skeleton className="h-6 w-full max-w-3xl mb-2" />
          <Skeleton className="h-6 w-4/5 max-w-2xl" />
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl mt-12">
        {/* Search & Filters Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 bg-card p-4 rounded-2xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          
          <div className="flex gap-4">
            <Skeleton className="h-12 w-[140px] rounded-xl" />
            <Skeleton className="h-12 w-[160px] rounded-xl" />
          </div>
        </div>

        {/* Catalog Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col h-full">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              
              <div className="p-5 flex flex-col flex-grow">
                <Skeleton className="h-4 w-1/3 mb-3" />
                <Skeleton className="h-8 w-4/5 mb-6" />
                
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3 mb-6" />
                
                <Skeleton className="h-14 w-full rounded-lg mb-6" />
                
                <div className="flex gap-3 mt-auto">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
