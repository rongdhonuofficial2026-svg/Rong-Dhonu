import { createClient } from "@/lib/supabase/server"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { EmptyState } from "@/components/museum/states"

export default async function MyArtworksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: artworks } = await supabase
    .from('artworks')
    .select('*')
    .eq('artist_id', user.id)
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
      case 'changes_requested': return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
      case 'rejected': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">
            {locale === 'bn' ? "আমার শিল্পকর্ম" : "My Artworks"}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'bn' ? "আপনার জমা দেওয়া সমস্ত শিল্পকর্ম পরিচালনা করুন।" : "Manage your submitted artworks and view their status."}
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
          description={locale === 'bn' ? "প্রদর্শনীতে অংশগ্রহণের জন্য আপনার প্রথম শিল্পকর্ম জমা দিন।" : "Submit your first artwork to participate in exhibitions."} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {artworks.map((artwork: any) => {
            const title = locale === 'bn' ? (artwork.title_bn || artwork.title_en) : artwork.title_en
            return (
              <Card key={artwork.id} className="overflow-hidden flex flex-col group">
                <div className="relative aspect-[4/3] bg-muted w-full border-b border-border">
                  {artwork.main_image_url ? (
                    <Image 
                      src={artwork.main_image_url} 
                      alt={title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <ImageIcon className="w-10 h-10 opacity-50" />
                      <span className="text-sm font-medium">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="outline" className={`capitalize shadow-sm backdrop-blur-md bg-background/80 ${getStatusColor(artwork.status)}`}>
                      {artwork.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-serif text-xl font-bold line-clamp-1 mb-2">{title}</h3>
                  <div className="text-sm text-muted-foreground space-y-1 mb-6 flex-1">
                    <p>Submitted: {new Date(artwork.created_at).toLocaleDateString()}</p>
                    {artwork.year && <p>Year: {artwork.year}</p>}
                  </div>
                  
                  {(artwork.status === 'pending' || artwork.status === 'changes_requested') && (
                    <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-border">
                      {artwork.status === 'changes_requested' && artwork.notes && (
                        <div className="bg-amber-500/10 p-3 rounded-lg text-sm text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
                          <span className="font-bold block mb-1">Moderator Notes:</span>
                          {artwork.notes}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                          <Edit2 className="w-4 h-4" /> {artwork.status === 'changes_requested' ? 'Submit Revision' : 'Edit'}
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" /> Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
