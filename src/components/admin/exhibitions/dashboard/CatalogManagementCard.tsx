'use client'

import { useState } from 'react'
import { Link } from '@/lib/i18n/routing'
import { useRouter } from 'next/navigation'
import { publishCatalog, deleteCatalog, duplicateCatalog } from '@/actions/catalogs'
import { toast } from 'sonner'
import {
  BookOpen, Plus, Eye, Edit, Trash, Power, Copy,
  Globe, Lock, Archive, FileText, Download, Loader2,
  ChevronRight, Clock
} from 'lucide-react'

// ── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    draft:     { label: 'Draft',     className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    published: { label: 'Published', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    archived:  { label: 'Archived',  className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' },
  }
  const s = map[status] ?? { label: status, className: 'bg-white/10 text-white/60 border-white/20' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${s.className}`}>
      {status === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      {status === 'draft'     && <Clock className="w-2.5 h-2.5" />}
      {status === 'archived'  && <Archive className="w-2.5 h-2.5" />}
      {s.label}
    </span>
  )
}

// ── Row Actions ─────────────────────────────────────────────────────────────
function CatalogRowActions({ catalog, exhibitionId }: { catalog: any; exhibitionId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  const run = async (key: string, fn: () => Promise<any>, successMsg: string) => {
    setBusy(key)
    try {
      const res = await fn()
      if (res.success) { toast.success(successMsg); router.refresh() }
      else toast.error(res.message)
    } catch { toast.error('Unexpected error') }
    finally { setBusy(null) }
  }

  const isPublished = catalog.status === 'published'
  const isArchived  = catalog.status === 'archived'

  // NOTE: Do NOT use PremiumButton with asChild here — it causes motion.create(Slot) infinite loops.
  return (
    <div className="flex items-center gap-1">
      {/* Preview */}
      <a
        href={catalog.pdf_url}
        target="_blank"
        rel="noopener noreferrer"
        title="Preview PDF"
        className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
      >
        <Eye className="w-3.5 h-3.5" />
      </a>

      {/* Edit */}
      <Link
        href={`/admin/catalogs/${catalog.id}`}
        title="Edit catalog"
        className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
      >
        <Edit className="w-3.5 h-3.5" />
      </Link>

      {/* Publish / Unpublish */}
      {!isArchived && (
        <button
          title={isPublished ? 'Unpublish' : 'Publish'}
          disabled={!!busy}
          onClick={() => run(
            'publish',
            () => publishCatalog(catalog.id, !isPublished),
            isPublished ? 'Catalog unpublished.' : 'Catalog published!'
          )}
          className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors disabled:opacity-40
            ${isPublished
              ? 'text-rose-400 hover:bg-rose-500/15'
              : 'text-emerald-400 hover:bg-emerald-500/15'}`}
        >
          {busy === 'publish'
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Power className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Duplicate */}
      <button
        title="Duplicate as draft"
        disabled={!!busy}
        onClick={() => run('dup', () => duplicateCatalog(catalog.id), 'Duplicated as new draft.')}
        className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors disabled:opacity-40"
      >
        {busy === 'dup'
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Copy className="w-3.5 h-3.5" />}
      </button>

      {/* Delete */}
      <button
        title="Delete catalog"
        disabled={!!busy}
        onClick={() => {
          if (!confirm(`Delete "${catalog.title_en}"? This cannot be undone and will remove all storage files.`)) return
          run('del', () => deleteCatalog(catalog.id), 'Catalog deleted.')
        }}
        className="h-7 w-7 flex items-center justify-center rounded-md text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/15 transition-colors disabled:opacity-40"
      >
        {busy === 'del'
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Trash className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

// ── Main Card ───────────────────────────────────────────────────────────────
export function CatalogManagementCard({
  exhibition,
  catalogs,
}: {
  exhibition: any
  catalogs: any[]
}) {
  const published = catalogs.find(c => c.status === 'published')
  const drafts    = catalogs.filter(c => c.status === 'draft')
  const archived  = catalogs.filter(c => c.status === 'archived')

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
            <BookOpen className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-base leading-tight">Catalog Versions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {catalogs.length === 0
                ? 'No versions yet — create the first one below.'
                : `${catalogs.length} version${catalogs.length > 1 ? 's' : ''} · ${published ? '1 published' : 'none published'}`}
            </p>
          </div>
        </div>

        {/* Create version button */}
        <Link
          href={`/admin/catalogs/new?exhibition_id=${exhibition.id}`}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          New Version
        </Link>
      </div>

      {/* Empty state */}
      {catalogs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 text-center px-6">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">No catalog versions yet</p>
          <p className="text-xs text-muted-foreground/60 mb-4">
            Upload an official PDF catalog for this exhibition.
          </p>
          <Link
            href={`/admin/catalogs/new?exhibition_id=${exhibition.id}`}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg border border-border bg-background text-xs font-medium hover:bg-muted transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Create First Version
          </Link>
        </div>
      )}

      {/* Version Table */}
      {catalogs.length > 0 && (
        <div className="divide-y divide-border/40">
          {catalogs.map((cat) => {
            const coverSrc = cat.cover_image_url || exhibition.hero_image_url
            return (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
              >
                {/* Thumbnail */}
                <div className="w-9 h-11 rounded-md overflow-hidden border border-border/40 shrink-0 bg-muted">
                  {coverSrc
                    ? <img src={coverSrc} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-muted-foreground/40" />
                      </div>}
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-muted-foreground/70 bg-muted/60 px-1.5 py-0.5 rounded">
                      v{cat.version}
                    </span>
                    <StatusBadge status={cat.status} />
                    <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                      {cat.category}
                    </span>
                    {cat.visibility === 'public'
                      ? <span title="Public"><Globe className="w-3 h-3 text-muted-foreground/40" /></span>
                      : <span title="Private"><Lock  className="w-3 h-3 text-muted-foreground/40" /></span>}
                  </div>
                  <p className="text-sm font-medium truncate mt-0.5">{cat.title_en}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground/50">
                    {cat.file_size > 0 && <span>{(cat.file_size / 1024 / 1024).toFixed(1)} MB</span>}
                    {cat.page_count  && <span>{cat.page_count}pp</span>}
                    <span className="flex items-center gap-0.5">
                      <Download className="w-2.5 h-2.5" />{cat.total_downloads ?? 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <CatalogRowActions catalog={cat} exhibitionId={exhibition.id} />
              </div>
            )
          })}
        </div>
      )}

      {/* Footer link to full catalog management page */}
      {catalogs.length > 0 && (
        <div className="px-5 py-3 border-t border-border/40 bg-muted/20">
          <Link
            href="/admin/catalogs"
            className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all catalogs <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  )
}
