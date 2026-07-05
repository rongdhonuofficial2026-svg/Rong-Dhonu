import { createClient } from "@/lib/supabase/server"
import { ModerationTable } from "@/components/admin/ModerationTable"

export default async function ArtworkModerationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  // Fetch pending artworks by default, but fetch everything to allow filtering in client
  const { data: artworks, error } = await supabase
    .from('artworks')
    .select(`
      *,
      profiles!artist_id (
        first_name_en, last_name_en, phone
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-destructive">Error loading artworks: {error.message}</div>
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold mb-2">Artwork Moderation</h1>
        <p className="text-muted-foreground">Review, approve, or request changes for submitted artworks.</p>
      </div>

      <ModerationTable artworks={artworks || []} locale={locale} />
    </div>
  )
}
