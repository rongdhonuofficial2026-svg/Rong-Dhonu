'use client'

import { useState } from 'react'
import { Eye } from 'lucide-react'
import { CatalogPreviewModal } from './CatalogPreviewModal'

interface CatalogPreviewButtonProps {
  pdfUrl: string
  title: string
  catalogId: string
  className?: string
}

export function CatalogPreviewButton({ pdfUrl, title, catalogId, className }: CatalogPreviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center justify-center gap-2 h-14 text-base font-semibold rounded-xl border-2 bg-background hover:bg-muted transition-colors shadow-sm ${className || ''}`}
      >
        <Eye className="w-5 h-5" /> Preview PDF
      </button>

      <CatalogPreviewModal
        pdfUrl={pdfUrl}
        title={title}
        catalogId={catalogId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
