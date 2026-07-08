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

  const svgSize = isFeatured ? "15" : "13";

  return (
    <button 
      onClick={handleDownload}
      disabled={isLoading}
      className={className || "btn btn-gold"}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg width={svgSize} height={svgSize} viewBox="0 0 20 20" fill="none">
          <path d="M10 3v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 15v1.5A1.5 1.5 0 0 0 5.5 18h9a1.5 1.5 0 0 0 1.5-1.5V15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      )}
      <span>{isLoading ? '...' : label}</span>
    </button>
  )
}
