import type { DashboardData, DashboardKPIs } from '@/types/dashboard'
import { Link } from '@/lib/i18n/routing'
import { BookOpen, ImagePlus, FileText, ArrowRight, Users } from 'lucide-react'

interface PlatformMiniPanelsProps {
  catalogStatusBreakdown: DashboardData['catalogStatusBreakdown']
  galleryBreakdown: DashboardData['galleryBreakdown']
  cmsSections: DashboardData['cmsSections']
  kpis: DashboardKPIs
}

function MiniPanel({ title, href, icon: Icon, children }: {
  title: string
  href: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <Link href={href as any}>
      <div className="group bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl p-5 h-full hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
        </div>
        {children}
      </div>
    </Link>
  )
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/20 dark:border-white/5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  )
}

export function PlatformMiniPanels({ catalogStatusBreakdown, galleryBreakdown, cmsSections, kpis }: PlatformMiniPanelsProps) {
  // Find most recently updated CMS section
  const lastCmsUpdate = cmsSections.length > 0
    ? [...cmsSections].sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())[0]
    : null

  const lastUploadDate = galleryBreakdown.lastUpload
    ? new Date(galleryBreakdown.lastUpload).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Never'

  return (
    <section aria-labelledby="platform-overview-heading">
      <h2 id="platform-overview-heading" className="sr-only">Platform Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* CMS */}
        <MiniPanel title="CMS Engine" href="/admin/cms" icon={FileText}>
          <StatRow label="Content Sections" value={cmsSections.length} />
          <StatRow label="Pages Managed" value={[...new Set(cmsSections.map(s => s.page))].length} />
          {lastCmsUpdate ? (
            <StatRow
              label="Last Updated"
              value={new Date(lastCmsUpdate.updated_at || 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
          ) : (
             <StatRow label="Last Updated" value="—" />
          )}
          <StatRow label="Active Section" value={lastCmsUpdate?.section ?? '—'} />
        </MiniPanel>

        {/* Gallery */}
        <MiniPanel title="Gallery Media" href="/admin/gallery" icon={ImagePlus}>
          <StatRow label="Images" value={galleryBreakdown.images} />
          <StatRow label="Videos" value={galleryBreakdown.videos} />
          <StatRow label="Last Upload" value={lastUploadDate} />
          <StatRow label="Total Media" value={galleryBreakdown.images + galleryBreakdown.videos} />
        </MiniPanel>

        {/* Catalogs */}
        <MiniPanel title="Catalogs" href="/admin/catalogs" icon={BookOpen}>
          <StatRow label="Published" value={catalogStatusBreakdown.published} />
          <StatRow label="Drafts" value={catalogStatusBreakdown.draft} />
          <StatRow label="Archived" value={catalogStatusBreakdown.archived} />
          <StatRow label="Total Downloads" value={kpis.totalCatalogDownloads.toLocaleString()} />
        </MiniPanel>

        {/* Users */}
        <MiniPanel title="Users & Directory" href="/admin/users" icon={Users}>
          <StatRow label="Artists (Members)" value={kpis.totalArtists} />
          <StatRow label="Administrators" value={kpis.totalAdmins} />
          <StatRow label="Pending Applications" value={kpis.pendingParticipants} />
          <StatRow label="New This Month" value={`+${kpis.newArtistsThisMonth}`} />
        </MiniPanel>

      </div>
    </section>
  )
}
