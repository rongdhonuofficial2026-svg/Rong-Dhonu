import { createClient } from "@/lib/supabase/server"
import { ArrowLeft } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

import { LifecycleProgressBar } from "@/components/admin/exhibitions/dashboard/LifecycleProgressBar"
import { ExhibitionCompletionChecklist } from "@/components/admin/exhibitions/dashboard/ExhibitionCompletionChecklist"
import { StatusControlCard } from "@/components/admin/exhibitions/dashboard/StatusControlCard"
import { BasicInfoCard } from "@/components/admin/exhibitions/dashboard/BasicInfoCard"
import { HeroBannerCard } from "@/components/admin/exhibitions/dashboard/HeroBannerCard"
import { HomepagePromotionCard } from "@/components/admin/exhibitions/dashboard/HomepagePromotionCard"
import { GalleryAlbumCard } from "@/components/admin/exhibitions/dashboard/GalleryAlbumCard"
import { CatalogManagementCard } from "@/components/admin/exhibitions/dashboard/CatalogManagementCard"
import { ExhibitionAnalyticsCard } from "@/components/admin/exhibitions/dashboard/ExhibitionAnalyticsCard"
import { ArtistParticipationCard } from "@/components/admin/exhibitions/dashboard/ArtistParticipationCard"
import { ArtworkSubmissionsCard } from "@/components/admin/exhibitions/dashboard/ArtworkSubmissionsCard"

export default async function ExhibitionDashboardPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: initialExhibition, error } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !initialExhibition) {
    return <div className="p-8 text-destructive">Exhibition not found.</div>
  }

  let exhibition = initialExhibition

  // Lazy sync the exhibition lifecycle
  const { syncExhibitionLifecycle } = await import('@/lib/exhibition-lifecycle')
  const synced = await syncExhibitionLifecycle(exhibition, supabase)
  if (synced) exhibition = synced

  // Fetch related counts and catalog
  const [galleryRes, catalogRes, artistsRes, artworksRes] = await Promise.all([
    supabase.from('gallery_media').select('id', { count: 'exact', head: true }).eq('exhibition_id', id),
    supabase.from('catalogs').select('*').eq('exhibition_id', id).order('version', { ascending: false }),
    supabase.from('exhibition_participants').select('id', { count: 'exact', head: true }).eq('exhibition_id', id),
    supabase.from('artworks').select('id', { count: 'exact', head: true }).eq('exhibition_id', id),
  ])

  const galleryCount = galleryRes.count || 0
  const catalogs = catalogRes.data || []
  const artistsCount = artistsRes?.count || 0
  const artworksCount = artworksRes?.count || 0

  return (
    <div className="admin-exhibition-dashboard space-y-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/exhibitions">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-3xl font-bold">Exhibition Dashboard</h1>
          <p className="text-muted-foreground">{exhibition.theme_en}</p>
        </div>
      </div>

      <LifecycleProgressBar currentStatus={exhibition.status} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <StatusControlCard exhibition={exhibition} />
          <BasicInfoCard exhibition={exhibition} />
          <HeroBannerCard exhibition={exhibition} />
          <GalleryAlbumCard exhibition={exhibition} />
          <CatalogManagementCard exhibition={exhibition} catalogs={catalogs} />
        </div>
        
        <div className="space-y-8">
          <ExhibitionCompletionChecklist 
            exhibition={exhibition} 
            artworksCount={artworksCount} 
            artistsCount={artistsCount} 
            galleryCount={galleryCount} 
            hasCatalog={catalogs.length > 0} 
          />
          <HomepagePromotionCard exhibition={exhibition} />
          <ArtistParticipationCard exhibition={exhibition} count={artistsCount} />
          <ArtworkSubmissionsCard exhibition={exhibition} count={artworksCount} />
          <ExhibitionAnalyticsCard exhibition={exhibition} />
        </div>
      </div>
    </div>
  )
}
