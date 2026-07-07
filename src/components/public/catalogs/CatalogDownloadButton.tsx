'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

export function CatalogDownloadButton({ catalog, className }: { catalog: any, className?: string }) {
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
    <Button 
      size="sm" 
      className={className || "gap-2"} 
      onClick={handleDownload}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {isLoading ? 'Opening...' : 'Download PDF'}
    </Button>
  )
}
