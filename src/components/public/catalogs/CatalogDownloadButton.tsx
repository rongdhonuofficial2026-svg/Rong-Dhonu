'use client'

import { useState } from 'react'

export function CatalogDownloadButton({ catalog, className, label = 'Download PDF', isFeatured = false }: { catalog: any, className?: string, label?: string, isFeatured?: boolean }) {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleDownload = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      // Route through the analytics-aware API endpoint
      // This logs the download and then redirects to the PDF
      window.open(`/api/catalogs/download?id=${catalog.id}`, '_blank', 'noopener,noreferrer')
    } finally {
      // Small delay to show the loading state before resetting
      setTimeout(() => setIsLoading(false), 1500)
    }
  }

  return (
    <button 
      onClick={handleDownload}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2.5 transition-all duration-300 ${className || 'btn btn-gold'}`}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="none">
          <path d="M10 2v11m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 16v1A1 1 0 0 0 4 18h12a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      )}
      <span className="truncate">{isLoading ? 'Loading...' : label}</span>
    </button>
  )
}
