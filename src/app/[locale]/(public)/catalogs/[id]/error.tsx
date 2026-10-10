'use client'

import { useEffect } from 'react'
import { Link } from '@/lib/i18n/routing'
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react'

export default function CatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Catalog preview error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0B0908] text-[#F4EEDF] pt-28 pb-20 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto px-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto shadow-2xl">
          <AlertCircle className="w-10 h-10 text-[#F4C662]" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
            Unable to Load Catalog Preview
          </h1>
          <p className="text-sm text-[#F4EEDF]/70 leading-relaxed font-light">
            We encountered a problem while retrieving this exhibition publication. The document might be temporarily unavailable or unlinked.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            type="button"
            onClick={reset}
            className="px-6 py-3 rounded-full bg-[#F4C662] hover:bg-[#ebd083] text-[#0B0908] text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-[#F4C662]/10 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          
          <Link
            href="/catalogs"
            className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold tracking-wider uppercase text-white transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalogs</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
