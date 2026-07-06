import type { ArtworkWithArtistAndImage } from '@/types/dashboard'
import Image from 'next/image'
import { Link } from '@/lib/i18n/routing'
import { cn } from '@/lib/utils'
import { Image as ImageIcon } from 'lucide-react'

interface RecentArtworksPanelProps {
  artworks: ArtworkWithArtistAndImage[]
}

const STATUS_STYLES = {
  pending:  'bg-amber-500/20 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
}

export function RecentArtworksPanel({ artworks }: RecentArtworksPanelProps) {
  return (
    <section aria-labelledby="artworks-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="artworks-heading" className="font-serif text-2xl font-semibold tracking-tight">Recent Submissions</h2>
        <Link href="/admin/artworks" className="text-sm text-accent hover:text-accent/80 font-medium transition-colors">
          View all →
        </Link>
      </div>

      {artworks.length === 0 ? (
        <div className="py-16 text-center bg-white/20 dark:bg-black/20 rounded-2xl border border-white/30 dark:border-white/5">
          <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4 mx-auto">
            <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="font-serif text-xl mb-1">No artworks yet</p>
          <p className="text-sm text-muted-foreground">Artwork submissions will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {artworks.map((artwork) => {
            const thumb = artwork.artwork_images
              ?.sort((a, b) => (a.order_index ?? 99) - (b.order_index ?? 99))
              ?.[0]?.url_thumbnail
            const status = artwork.status ?? 'pending'
            const statusStyle = STATUS_STYLES[status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.pending

            return (
              <Link key={artwork.id} href={`/admin/artworks` as any}>
                <div className="group bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300">
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={artwork.title_en}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-muted-foreground/20" />
                      </div>
                    )}
                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span className={cn('px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md', statusStyle)}>
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="font-serif font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">{artwork.title_en}</p>
                    <p className="text-xs text-muted-foreground mt-1">{artwork.profiles?.full_name_en || 'Unknown Artist'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {artwork.medium_en && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/30 text-muted-foreground">{artwork.medium_en}</span>
                      )}
                      {artwork.category && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/30 text-muted-foreground">{artwork.category}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
