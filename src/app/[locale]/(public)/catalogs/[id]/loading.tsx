import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft } from 'lucide-react'
import { Link } from '@/lib/i18n/routing'

export default function CatalogDetailLoading() {
  return (
    <div className="min-h-screen bg-background pb-24 pt-24 md:pt-32">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <Link 
          href="/catalogs" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Archive
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Cover Image & Actions Skeleton */}
          <div className="lg:col-span-5 flex flex-col">
            <Skeleton className="aspect-[3/4] w-full rounded-2xl mb-8" />
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="flex-1 h-14 rounded-xl" />
              <Skeleton className="flex-1 h-14 rounded-xl" />
            </div>
          </div>

          {/* Right Column: Metadata Skeleton */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-16 w-3/4 mb-4" />
            <Skeleton className="h-8 w-2/3 mb-8" />

            <div className="mb-12 flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-border/50">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <Skeleton className="h-4 w-40" />
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-12 w-48 rounded-lg" />
                <Skeleton className="h-12 w-48 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
