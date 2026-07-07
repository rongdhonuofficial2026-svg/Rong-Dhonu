'use client'

import { useState } from 'react'
import { Link } from '@/lib/i18n/routing'
import { deleteCatalog, publishCatalog } from '@/actions/catalogs'
import { PremiumButton } from '@/components/admin/ui/PremiumButton'
import { Edit, Trash, Power, Eye, ArrowDownToLine, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CatalogActions({ catalog }: { catalog: any }) {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleTogglePublish = async () => {
    setIsPublishing(true)
    try {
      const newStatus = catalog.status === 'published' ? false : true
      const res = await publishCatalog(catalog.id, newStatus)
      if (res.success) {
        toast.success(`Catalog ${newStatus ? 'published' : 'unpublished'} successfully`)
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this catalog? The PDF will be removed permanently.')) return
    
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

  return (
    <>
      <PremiumButton variant="glass" className="flex-1 h-9 px-0" asChild>
        <Link href={`/admin/catalogs/${catalog.id}`}>
          <Edit className="w-4 h-4 mr-2" /> Edit
        </Link>
      </PremiumButton>

      <PremiumButton 
        variant="glass" 
        className="flex-1 h-9 px-0"
        onClick={handleTogglePublish}
        disabled={isPublishing || isDeleting}
      >
        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className={`w-4 h-4 mr-2 ${catalog.status === 'published' ? 'text-rose-400' : 'text-emerald-400'}`} />}
        {catalog.status === 'published' ? 'Unpublish' : 'Publish'}
      </PremiumButton>

      <PremiumButton variant="glass" className="flex-1 h-9 px-0" asChild>
        <a href={catalog.pdf_url} target="_blank" rel="noopener noreferrer">
          <Eye className="w-4 h-4 mr-2" /> View
        </a>
      </PremiumButton>

      <PremiumButton 
        variant="glass" 
        className="w-9 h-9 px-0 flex-shrink-0 flex items-center justify-center border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500"
        onClick={handleDelete}
        disabled={isPublishing || isDeleting}
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
      </PremiumButton>
    </>
  )
}
