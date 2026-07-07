import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fetchDashboardData } from '@/lib/dashboard-service'

// Dashboard section components
import { DashboardHero }         from '@/components/admin/dashboard/DashboardHero'
import { KPIGrid }               from '@/components/admin/dashboard/KPIGrid'
import { PendingActionsPanel }   from '@/components/admin/dashboard/PendingActionsPanel'
import { ExhibitionLifecycle }   from '@/components/admin/dashboard/ExhibitionLifecycle'
import { ActivityTimeline }      from '@/components/admin/dashboard/ActivityTimeline'
import { QuickActions }          from '@/components/admin/dashboard/QuickActions'
import { RecentArtworksPanel }   from '@/components/admin/dashboard/RecentArtworksPanel'
import { RecentArtistsPanel }    from '@/components/admin/dashboard/RecentArtistsPanel'
import { UpcomingEvents }        from '@/components/admin/dashboard/UpcomingEvents'
import { PlatformMiniPanels }    from '@/components/admin/dashboard/PlatformMiniPanels'

import { NotificationCenter }    from '@/components/admin/dashboard/NotificationCenter'
import { UserOverviewPanel }     from '@/components/admin/dashboard/UserOverviewPanel'
import { SystemHealthPanel }     from '@/components/admin/dashboard/SystemHealthPanel'

export default async function AdminDashboardOverview({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  // Auth guard — layout already redirects, but verify here for type safety
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  // ── Single batched data fetch (all queries fired in parallel) ─────────────
  const data = await fetchDashboardData(supabase, user.id)

  return (
    <div className="space-y-8 pb-16" role="main" aria-label="Admin Overview Dashboard">

      {/* 1. Executive summary hero */}
      <DashboardHero
        currentUser={data.currentUser}
        activeExhibition={data.activeExhibition}
      />

      {/* 2. Platform KPIs */}
      <KPIGrid kpis={data.kpis} />

      {/* 3. Pending actions + Exhibition lifecycle */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingActionsPanel kpis={data.kpis} />
        <ExhibitionLifecycle activeExhibition={data.activeExhibition} />
      </section>

      {/* 4. Activity timeline + Quick actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityTimeline audits={data.recentAudits} />
        </div>
        <div className="space-y-6">
          <QuickActions />
        </div>
      </section>

      {/* 5. Recent artworks */}
      <RecentArtworksPanel artworks={data.recentArtworks} />

      {/* 6. Recent artists + Upcoming events */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentArtistsPanel artists={data.recentArtists} />
        <UpcomingEvents events={data.upcomingEvents} />
      </section>

      {/* 7. Platform mini panels (Catalogs, Gallery, CMS) */}
      <PlatformMiniPanels
        catalogStatusBreakdown={data.catalogStatusBreakdown}
        galleryBreakdown={data.galleryBreakdown}
        cmsSections={data.cmsSections}
        kpis={{ totalCatalogDownloads: data.kpis.totalCatalogDownloads }}
      />

      {/* 8. Notifications */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NotificationCenter notifications={data.recentNotifications} />
      </section>

      {/* 9. User overview with analytics */}
      <UserOverviewPanel kpis={data.kpis} />

      {/* 10. System health + platform footer */}
      <SystemHealthPanel />

    </div>
  )
}
