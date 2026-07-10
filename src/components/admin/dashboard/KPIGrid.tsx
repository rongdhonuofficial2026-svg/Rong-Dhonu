import type { DashboardKPIs, DashboardData } from '@/types/dashboard'
import { MetricTile } from './MetricTile'
import {
  Users, Image as ImageIcon, AlertCircle, CheckCircle,
  Paintbrush, BookOpen, ImagePlus, Bell, FileText
} from 'lucide-react'

interface KPIGridProps {
  kpis: DashboardKPIs
  cmsSections: DashboardData['cmsSections']
}

export function KPIGrid({ kpis, cmsSections }: KPIGridProps) {
  const approvedText = kpis.approvalRate > 0 ? `${kpis.approvalRate}% approval rate` : undefined
  const artistTrend  = kpis.newArtistsThisMonth > 0 ? `+${kpis.newArtistsThisMonth} this month` : undefined
  const totalCmsPages = Array.from(new Set(cmsSections.map(s => s.page))).filter(Boolean).length

  return (
    <section aria-labelledby="kpi-heading" className="space-y-6">
      <div className="admin-kpi-grid grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricTile
          title="Artists"
          value={kpis.totalArtists}
          icon={Users}
          colorTheme="emerald"
          trend={artistTrend}
          trendPositive={kpis.newArtistsThisMonth > 0}
          href="/admin/users"
        />
        <MetricTile
          title="Artworks"
          value={kpis.totalArtworks}
          icon={ImageIcon}
          colorTheme="blue"
          trend={approvedText}
          trendPositive
          href="/admin/artworks"
        />
        <MetricTile
          title="Pending Reviews"
          value={kpis.pendingArtworks}
          icon={AlertCircle}
          colorTheme="amber"
          trend={kpis.pendingArtworks > 0 ? 'Action required' : 'All clear'}
          trendPositive={kpis.pendingArtworks === 0}
          href="/admin/artworks"
        />
        <MetricTile
          title="Active Exhibition"
          value={kpis.activeExhibitions}
          icon={Paintbrush}
          colorTheme="purple"
          trend={`${kpis.totalExhibitions} total exhibitions`}
          trendPositive={kpis.activeExhibitions > 0}
          href="/admin/exhibitions"
        />
        <MetricTile
          title="Published Catalogs"
          value={kpis.publishedCatalogs}
          icon={BookOpen}
          colorTheme="teal"
          trend={`${kpis.draftCatalogs} in draft`}
          trendPositive={kpis.draftCatalogs === 0}
          href="/admin/catalogs"
        />
        <MetricTile
          title="Gallery Media"
          value={kpis.totalGalleryMedia}
          icon={ImagePlus}
          colorTheme="rose"
          trend={`${kpis.totalImages} images · ${kpis.totalVideos} videos`}
          trendPositive
          href="/admin/gallery"
        />
        <MetricTile
          title="CMS Pages"
          value={totalCmsPages}
          icon={FileText}
          colorTheme="indigo"
          trend={`${cmsSections.length} sections`}
          trendPositive
          href="/admin/cms"
        />
        <MetricTile
          title="Unread Alerts"
          value={kpis.unreadNotifications}
          icon={Bell}
          colorTheme="gold"
          trend={kpis.unreadNotifications > 0 ? 'Needs attention' : 'All caught up'}
          trendPositive={kpis.unreadNotifications === 0}
        />
      </div>
    </section>
  )
}
