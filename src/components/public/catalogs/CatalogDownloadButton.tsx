'use client'

import { incrementDownloadCount } from '@/actions/catalogs'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function CatalogDownloadButton({ catalog, className }: { catalog: any, className?: string }) {
  
  const handleDownload = async () => {
    // 1. Trigger the download count increment in background
    await incrementDownloadCount(catalog.id).catch(console.error)
    
    // 2. Open PDF
    window.open(catalog.pdf_url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Button size="sm" className={className || "gap-2"} onClick={handleDownload}>
      <Download className="w-4 h-4" />
      Download PDF
    </Button>
  )
}
