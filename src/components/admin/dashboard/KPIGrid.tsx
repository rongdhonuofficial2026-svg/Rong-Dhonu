import type { DashboardKPIs } from '@/types/dashboard'
import { MetricTile } from './MetricTile'
import {
  Users, Image as ImageIcon, AlertCircle, CheckCircle,
  Paintbrush, BookOpen, ImagePlus, Bell,
} from 'lucide-react'

interface KPIGridProps {
  kpis: DashboardKPIs
}

export function KPIGrid({ kpis }: KPIGridProps) {
  const approvedText = kpis.approvalRate > 0 ? `${kpis.approvalRate}% approval rate` : undefined
  const artistTrend  = kpis.newArtistsThisMonth > 0 ? `+${kpis.newArtistsThisMonth} this month` : undefined

  return (
    <section aria-labelledby="kpi-heading">
      <h2 id="kpi-heading" className="font-serif text-2xl font-semibold tracking-tight mb-6">
        Platform Pulse
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricTile
          title="Total Artists"
          value={kpis.totalArtists}
          icon={Users}
          colorTheme="emerald"
          trend={artistTrend}
          trendPositive={kpis.newArtistsThisMonth > 0}
          href="/admin/users"
        />
        <MetricTile
          title="Total Artworks"
          value={kpis.totalArtworks}
          icon={ImageIcon}
          colorTheme="blue"
          href="/admin/artworks"
        />
        <MetricTile
          title="Pending Moderation"
          value={kpis.pendingArtworks}
          icon={AlertCircle}
          colorTheme="amber"
          trend={kpis.pendingArtworks > 0 ? 'Action required' : 'All clear'}
          trendPositive={kpis.pendingArtworks === 0}
          href="/admin/artworks"
        />
        <MetricTile
          title="Approved Artworks"
          value={kpis.approvedArtworks}
          icon={CheckCircle}
          colorTheme="emerald"
          trend={approvedText}
          trendPositive
        />
        <MetricTile
          title="Exhibitions"
          value={kpis.totalExhibitions}
          icon={Paintbrush}
          colorTheme="purple"
          subtitle={`${kpis.activeExhibitions} active`}
          href="/admin/exhibitions"
        />

        <MetricTile
          title="Published Catalogs"
          value={kpis.publishedCatalogs}
          icon={BookOpen}
          colorTheme="teal"
          subtitle={`${kpis.draftCatalogs} in draft`}
          href="/admin/catalogs"
        />
        <MetricTile
          title="Gallery Media"
          value={kpis.totalGalleryMedia}
          icon={ImagePlus}
          colorTheme="rose"
          subtitle={`${kpis.totalImages} images · ${kpis.totalVideos} videos`}
          href="/admin/gallery"
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
