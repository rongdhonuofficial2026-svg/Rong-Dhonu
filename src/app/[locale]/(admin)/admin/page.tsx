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
    <div className="space-y-10 md:space-y-[80px] pb-12 md:pb-16 max-w-[1600px] mx-auto px-0 sm:px-2 lg:px-8 text-left" role="main" aria-label="Admin Overview Dashboard">

      {/* SECTION 1: Executive Header */}
      <DashboardHero
        currentUser={data.currentUser}
        activeExhibition={data.activeExhibition}
      />

      {/* SECTION 2: Platform KPI Grid */}
      <KPIGrid kpis={data.kpis} cmsSections={data.cmsSections} />

      {/* SECTION 3: Priority Center */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white capitalize">
          Priority Center
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <PendingActionsPanel kpis={data.kpis} />
          <ExhibitionLifecycle activeExhibition={data.activeExhibition} />
          <QuickActions />
        </div>
      </section>

      {/* SECTION 4: Operational Activity */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white capitalize">
          Operational Activity
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Recent Activity & Notifications (span-7) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            <div className="flex-1">
              <ActivityTimeline audits={data.recentAudits} />
            </div>
            <div className="flex-1">
              <NotificationCenter notifications={data.recentNotifications} />
            </div>
          </div>
          {/* Right Column: Recent Submissions & New Artists (span-5) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col">
            <div className="flex-1">
              <RecentArtworksPanel artworks={data.recentArtworks} />
            </div>
            <div className="flex-1">
              <RecentArtistsPanel artists={data.recentArtists} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Platform Modules */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white capitalize">
          Platform Modules
        </h2>
        <PlatformMiniPanels
          catalogStatusBreakdown={data.catalogStatusBreakdown}
          galleryBreakdown={data.galleryBreakdown}
          cmsSections={data.cmsSections}
          kpis={data.kpis}
        />
      </section>

      {/* SECTION 6: Analytics Snapshot */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white capitalize">
          Analytics Snapshot
        </h2>
        <UserOverviewPanel kpis={data.kpis} />
      </section>

      {/* SECTION 7: System Health */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white capitalize">
          System Health
        </h2>
        <SystemHealthPanel />
      </section>

    </div>
  )
}
