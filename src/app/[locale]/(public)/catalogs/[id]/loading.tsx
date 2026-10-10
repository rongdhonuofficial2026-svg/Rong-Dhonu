import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from '@/lib/i18n/routing'

export default function CatalogDetailLoading() {
  return (
    <div className="min-h-screen bg-[#0B0908] text-[#F4EEDF] pt-24 md:pt-28 pb-16">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Top navigation skeleton */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-8">
          <Link
            href="/catalogs"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#F4EEDF]/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Catalogs</span>
          </Link>
          <div className="h-10 w-32 rounded-full bg-white/5 animate-pulse" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-3 mb-8">
          <div className="h-5 w-48 rounded-full bg-[#F4C662]/10 animate-pulse" />
          <div className="h-10 w-3/4 max-w-xl rounded-xl bg-white/10 animate-pulse" />
          <div className="h-4 w-1/2 max-w-md rounded-lg bg-white/5 animate-pulse" />
        </div>

        {/* Viewer frame skeleton */}
        <div className="w-full h-[65vh] min-h-[500px] rounded-2xl md:rounded-3xl bg-[#120F0D] border border-white/10 flex flex-col items-center justify-center p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#F4C662]" />
            <p className="text-sm font-serif text-[#F4EEDF]/75">Loading exhibition catalog...</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
