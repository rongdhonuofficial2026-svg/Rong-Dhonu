'use client'

import { useState } from 'react'
import { Link } from '@/lib/i18n/routing'
import { deleteCatalog, publishCatalog, duplicateCatalog } from '@/actions/catalogs'
import { Edit, Trash, Power, Eye, Loader2, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const actionBase =
  'inline-flex min-h-11 items-center justify-center rounded-xl border text-xs font-semibold transition-all disabled:opacity-50'

export function CatalogActions({ catalog }: { catalog: any }) {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  const handleTogglePublish = async () => {
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

  return (
    <div className="admin-catalog-actions flex w-full flex-col gap-2.5 md:flex-row md:flex-wrap md:items-center md:gap-2">
      <div className="grid w-full grid-cols-2 gap-2.5 md:contents">
        <Link
          href={`/admin/catalogs/${catalog.id}`}
          className={cn(
            actionBase,
            'w-full border-white/[0.08] bg-white/5 text-white hover:border-white/20 hover:bg-white/10 md:flex-grow md:h-9 md:min-h-0 md:rounded-lg md:px-3 md:text-[11px]'
          )}
        >
          <Edit className="mr-1.5 h-4 w-4 md:h-3.5 md:w-3.5" />
          Edit
        </Link>

        {catalog.status !== 'archived' && (
          <button
            className={cn(
              actionBase,
              'w-full border-white/[0.08] bg-white/5 text-white hover:border-white/20 hover:bg-white/10 md:flex-grow md:h-9 md:min-h-0 md:rounded-lg md:px-3 md:text-[11px]'
            )}
            onClick={handleTogglePublish}
            disabled={isBusy}
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin md:h-3.5 md:w-3.5" />
            ) : (
              <>
                <Power
                  className={cn(
                    'mr-1.5 h-4 w-4 md:h-3.5 md:w-3.5',
                    catalog.status === 'published' ? 'text-rose-400' : 'text-emerald-400'
                  )}
                />
                {publishLabel}
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid w-full grid-cols-3 gap-2.5 md:contents">
        <button
          className={cn(
            actionBase,
            'col-span-1 border-[#C9A227]/20 bg-[#C9A227]/10 text-[#C9A227] hover:border-transparent hover:bg-[#C9A227] hover:text-black md:flex-grow md:h-9 md:min-h-0 md:rounded-lg md:px-3 md:text-[11px]'
          )}
          onClick={handleDuplicate}
          disabled={isBusy}
          title="Duplicate as new draft"
        >
          {isDuplicating ? (
            <Loader2 className="h-4 w-4 animate-spin md:h-3.5 md:w-3.5" />
          ) : (
            <>
              <Copy className="mr-1.5 h-4 w-4 md:mr-1 md:h-3.5 md:w-3.5" />
              <span className="md:inline">Copy</span>
            </>
          )}
        </button>

        <a
          href={catalog.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            actionBase,
            'border-white/[0.08] bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white md:h-9 md:w-9 md:min-h-0 md:flex-shrink-0 md:rounded-lg md:px-0'
          )}
          aria-label="Preview catalog PDF"
        >
          <Eye className="h-4 w-4 md:h-3.5 md:w-3.5" />
        </a>

        <button
          className={cn(
            actionBase,
            'border-rose-500/20 bg-rose-500/10 text-rose-400 hover:border-transparent hover:bg-rose-500 hover:text-white md:h-9 md:w-9 md:min-h-0 md:flex-shrink-0 md:rounded-lg md:px-0'
          )}
          onClick={handleDelete}
          disabled={isBusy}
          aria-label="Delete catalog"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin md:h-3.5 md:w-3.5" />
          ) : (
            <Trash className="h-4 w-4 md:h-3.5 md:w-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}
