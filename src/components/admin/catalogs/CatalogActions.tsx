'use client'

import { useState } from 'react'
import { Link } from '@/lib/i18n/routing'
import { deleteCatalog, publishCatalog, duplicateCatalog } from '@/actions/catalogs'
import { Edit, Trash, Power, Eye, Loader2, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CatalogActions({ catalog }: { catalog: any }) {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  const handleTogglePublish = async () => {
    // Only allow draft → published, not published → draft via this button
    if (catalog.status === 'archived') {
      toast.error('Archived catalogs cannot be re-published from here. Duplicate it first.')
      return
    }
    setIsPublishing(true)
    try {
      const shouldPublish = catalog.status !== 'published'
      const res = await publishCatalog(catalog.id, shouldPublish)
      if (res.success) {
        toast.success(`Catalog ${shouldPublish ? 'published' : 'unpublished'} successfully`)
        router.refresh()
      } else {
        toast.error(res.message)
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      const res = await duplicateCatalog(catalog.id)
      if (res.success) {
        toast.success('Catalog duplicated as a new draft!')
        router.refresh()
      } else {
        toast.error(res.message)
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsDuplicating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this catalog? The PDF and cover image will be permanently removed.')) return
    
    setIsDeleting(true)
    try {
      const res = await deleteCatalog(catalog.id)
      if (res.success) {
        toast.success('Catalog deleted successfully')
        router.refresh()
      } else {
        toast.error(res.message)
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const isBusy = isPublishing || isDeleting || isDuplicating
  const publishLabel = catalog.status === 'published' ? 'Unpublish' : 'Publish'

  // IMPORTANT: Do NOT use PremiumButton with asChild here.
  // PremiumButton uses motion.create(Slot) which creates a new component type on every render,
  // breaking React reconciliation and causing an infinite update loop → Error Boundary crash.
  // Use plain <a>, <Link>, or <button> elements instead.
  return (
    <>
      <Link
        href={`/admin/catalogs/${catalog.id}`}
        className="flex-grow h-9 px-3 inline-flex items-center justify-center text-[11px] font-semibold rounded-lg bg-white/5 border border-white/[0.08] text-white hover:bg-white/10 hover:border-white/20 transition-all"
      >
        <Edit className="w-3.5 h-3.5 mr-1" /> Edit
      </Link>

      {catalog.status !== 'archived' && (
        <button
          className="flex-grow h-9 px-3 inline-flex items-center justify-center text-[11px] font-semibold rounded-lg bg-white/5 border border-white/[0.08] text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
          onClick={handleTogglePublish}
          disabled={isBusy}
        >
          {isPublishing
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Power className={`w-3.5 h-3.5 mr-1 ${catalog.status === 'published' ? 'text-rose-400' : 'text-emerald-400'}`} />
          }
          {publishLabel}
        </button>
      )}

      <button
        className="flex-grow h-9 px-3 inline-flex items-center justify-center text-[11px] font-semibold rounded-lg bg-[#C9A227]/10 border border-[#C9A227]/20 text-[#C9A227] hover:bg-[#C9A227] hover:text-black hover:border-transparent transition-all disabled:opacity-50"
        onClick={handleDuplicate}
        disabled={isBusy}
        title="Duplicate as new draft"
      >
        {isDuplicating
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Copy className="w-3.5 h-3.5 mr-1" />
        }
        Copy
      </button>

      <a
        href={catalog.pdf_url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/5 border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
      >
        <Eye className="w-3.5 h-3.5" />
      </a>

      <button
        className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-transparent transition-all disabled:opacity-50"
        onClick={handleDelete}
        disabled={isBusy}
      >
        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash className="w-3.5 h-3.5" />}
      </button>
    </>
  )
}
