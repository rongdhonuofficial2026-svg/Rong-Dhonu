import { createClient } from "@/lib/supabase/server"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EmptyState } from "@/components/museum/states"
import { ArtworkCard } from "@/components/dashboard/artworks/ArtworkCard"

export default async function MyArtworksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: artworks } = await supabase
    .from('artworks')
    .select(`
      id, title_en, title_bn, description_en, description_bn, main_image_url, status, created_at,
      category, medium_en, medium_bn, dimensions, price,
      moderator_feedback, notes, approved_at, revision_notes,
      exhibition_id,
      exhibitions!exhibition_id(id, theme_en, theme_bn, year)
    `)
    .eq('artist_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">
            {locale === 'bn' ? "আমার শিল্পকর্ম" : "My Artworks"}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'bn'
              ? "আপনার জমা দেওয়া সমস্ত শিল্পকর্ম পরিচালনা করুন।"
              : "Manage your submitted artworks and track their moderation status."}
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0 gap-2">
          <Link href="/dashboard/artworks/new">
            <Plus className="w-5 h-5" />
            {locale === 'bn' ? "নতুন জমা দিন" : "Submit New"}
          </Link>
        </Button>
      </div>

      {!artworks || artworks.length === 0 ? (
        <EmptyState
          title={locale === 'bn' ? "কোনো শিল্পকর্ম নেই" : "No Artworks Yet"}
          description={locale === 'bn'
            ? "প্রদর্শনীতে অংশগ্রহণের জন্য আপনার প্রথম শিল্পকর্ম জমা দিন।"
            : "Submit your first artwork to participate in the exhibition."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {artworks.map((artwork: any) => (
            <ArtworkCard key={artwork.id} artwork={artwork} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
