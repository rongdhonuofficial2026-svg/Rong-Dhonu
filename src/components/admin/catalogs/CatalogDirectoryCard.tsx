import Image from 'next/image'
import { FileText, CheckCircle, Clock } from 'lucide-react'
import { CatalogActions } from './CatalogActions'

interface CatalogDirectoryCardProps {
  catalog: {
    id: string
    title_en: string
    status: string
    version: number
    language: string
    file_size: number | null
    total_downloads: number | null
    created_at: string
    published_at: string | null
    cover_image_url: string | null
    exhibitions: { theme_en?: string; year?: number; hero_image_url?: string } | null
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 shadow-sm">
        <CheckCircle className="h-3 w-3" />
        Published
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400 shadow-sm">
      <Clock className="h-3 w-3" />
      Draft
    </span>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-catalog-meta-item flex flex-col gap-1 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 md:flex-row md:items-center md:justify-between md:rounded-none md:border-0 md:bg-transparent md:p-0">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</span>
      <span className="text-sm font-semibold text-white/90 md:text-[10px] md:font-mono md:font-semibold md:uppercase md:text-white/80">
        {value}
      </span>
    </div>
  )
}

export function CatalogDirectoryCard({ catalog }: CatalogDirectoryCardProps) {
  const exhibition = catalog.exhibitions
  const coverImage =
    catalog.cover_image_url || exhibition?.hero_image_url || '/images/catalogs_hero.png'
  const fileSize = catalog.file_size
    ? `${(catalog.file_size / 1024 / 1024).toFixed(2)} MB`
    : '—'

  return (
    <article className="admin-catalog-card group flex flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#171717]/90 shadow-xl shadow-black/25 transition-all duration-300 hover:border-white/[0.16] hover:shadow-2xl">
      {/* Mobile: badge above image */}
      <div className="px-5 pt-5 pb-3 md:hidden">
        <StatusBadge status={catalog.status} />
      </div>

      {/* Cover */}
      <div className="relative mx-4 aspect-[4/3] overflow-hidden rounded-2xl md:mx-0 md:aspect-auto md:h-52 md:rounded-none">
        <Image
          src={coverImage}
          alt={catalog.title_en}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Desktop: badge overlay */}
        <div className="absolute right-4 top-4 hidden md:block">
          <StatusBadge status={catalog.status} />
        </div>

        <div className="absolute -bottom-5 left-6 z-20 hidden h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#111111] shadow-lg shadow-black/40 md:flex">
          <FileText className="h-5 w-5 text-[#C9A227]" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-4 md:px-6 md:pb-6 md:pt-8">
        <div className="space-y-2">
          <h3 className="font-serif text-xl font-bold leading-snug tracking-wide text-white line-clamp-2 transition-colors duration-300 group-hover:text-[#C9A227] md:text-lg">
            {catalog.title_en}
          </h3>
          <p className="text-sm text-white/55 line-clamp-2 md:text-xs md:line-clamp-1">
            {exhibition?.theme_en || 'Unknown Exhibition'}
            {exhibition?.year ? ` · ${exhibition.year}` : ''}
          </p>
        </div>

        <div className="admin-catalog-meta-grid grid grid-cols-2 gap-3 border-y border-white/[0.05] py-4 md:gap-x-4 md:gap-y-2.5 md:border-white/[0.04] md:py-3.5">
          <MetaItem label="Version" value={`v${catalog.version}`} />
          <MetaItem label="Language" value={(catalog.language || '—').toUpperCase()} />
          <MetaItem label="Size" value={fileSize} />
          <MetaItem label="Downloads" value={String(catalog.total_downloads || 0)} />
        </div>

        <div className="grid grid-cols-1 gap-2 text-[10px] font-mono uppercase tracking-wider text-white/40 sm:grid-cols-2 md:flex md:items-center md:justify-between md:px-1 md:text-[9px] md:text-white/35">
          <span>Created: {new Date(catalog.created_at).toLocaleDateString()}</span>
          {catalog.published_at ? (
            <span className="sm:text-right">
              Published: {new Date(catalog.published_at).toLocaleDateString()}
            </span>
          ) : (
            <span className="hidden sm:block sm:text-right md:hidden">Not published yet</span>
          )}
        </div>

        <div className="mt-auto border-t border-white/[0.05] pt-4 md:border-white/[0.04]">
          <CatalogActions catalog={catalog} />
        </div>
      </div>
    </article>
  )
}
