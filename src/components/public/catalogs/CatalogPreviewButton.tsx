'use client'

import { useState } from 'react'
import { Eye } from 'lucide-react'
import { CatalogPreviewModal } from './CatalogPreviewModal'

interface CatalogPreviewButtonProps {
  pdfUrl: string
  title: string
  catalogId: string
  className?: string
  label?: string
}

export function CatalogPreviewButton({
  pdfUrl,
  title,
  catalogId,
  className,
  label = 'Preview Catalog'
}: CatalogPreviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center justify-center gap-2.5 h-12 px-5 text-xs font-bold tracking-widest uppercase rounded-full border border-white/20 bg-white/5 hover:bg-white/10 hover:border-[#F4C662]/40 text-[#F4EEDF] transition-all duration-300 shadow-sm active:scale-95 cursor-pointer ${
          className || ''
        }`}
      >
        <Eye className="w-4 h-4 text-[#F4C662]" />
        <span>{label}</span>
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
