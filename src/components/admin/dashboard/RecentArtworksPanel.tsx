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
    <div className="bg-[#171717]/90 border border-white/[0.08] rounded-[20px] p-6 h-full shadow-xl shadow-black/25 hover:border-white/[0.15] transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-semibold tracking-tight text-white">Recent Submissions</h2>
        <Link href="/admin/artworks" className="text-xs text-accent hover:text-accent/80 font-medium transition-colors">
          View all →
        </Link>
      </div>

      {artworks.length === 0 ? (
        <div className="py-12 text-center bg-black/20 rounded-xl border border-white/5">
          <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mb-3 mx-auto">
            <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
          </div>
          <p className="font-serif text-lg mb-1 text-white/70">No artworks yet</p>
          <p className="text-xs text-muted-foreground">Artwork submissions will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {artworks.slice(0, 4).map((artwork) => {
            const thumb = artwork.artwork_images
              ?.sort((a, b) => (a.order_index ?? 99) - (b.order_index ?? 99))
              ?.[0]?.url_thumbnail
            const status = artwork.status ?? 'pending'
            const statusStyle = STATUS_STYLES[status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.pending

            return (
              <Link key={artwork.id} href={`/admin/artworks` as any}>
                <div className="group bg-[#111111] border border-white/[0.06] rounded-xl overflow-hidden hover:border-accent/40 transition-all duration-300 h-full flex flex-col justify-between">
                  {/* Thumbnail */}
                  <div className="relative h-32 bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={artwork.title_en}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground/20" />
                      </div>
                    )}
                    {/* Status badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className={cn('px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border backdrop-blur-md', statusStyle)}>
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3.5 flex-grow">
                    <p className="font-serif font-semibold text-sm text-foreground line-clamp-1 group-hover:text-accent transition-colors">{artwork.title_en}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{artwork.profiles?.full_name_en || 'Unknown Artist'}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {artwork.medium_en && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/50">{artwork.medium_en}</span>
                      )}
                      {artwork.category && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/50">{artwork.category}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
