import type { DashboardData } from '@/types/dashboard'
import Image from 'next/image'
import { Link } from '@/lib/i18n/routing'
import { User } from 'lucide-react'

interface RecentArtistsPanelProps {
  artists: DashboardData['recentArtists']
}

export function RecentArtistsPanel({ artists }: RecentArtistsPanelProps) {
  return (
    <div className="bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-semibold tracking-tight">New Artists</h2>
        <Link href="/admin/users" className="text-xs text-accent hover:text-accent/80 font-medium transition-colors">
          View all →
        </Link>
      </div>

      {artists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <User className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No artists registered yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {artists.map((artist) => {
            const initial = (artist.full_name_en ?? 'A').charAt(0).toUpperCase()
            const joinDate = new Date(artist.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            return (
              <div key={artist.id} className="flex items-center gap-3 group">
                {/* Avatar */}
                <div className="shrink-0 relative w-10 h-10 rounded-full overflow-hidden border border-white/20 dark:border-white/10 bg-muted/20">
                  {artist.avatar_url ? (
                    <Image src={artist.avatar_url} alt={artist.full_name_en ?? 'Artist'} fill sizes="40px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif font-bold text-muted-foreground text-sm bg-gradient-to-br from-accent/10 to-transparent">
                      {initial}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                    {artist.full_name_en || 'Unnamed Artist'}
                  </p>
                  {artist.bio_en && (
                    <p className="text-xs text-muted-foreground truncate">{artist.bio_en}</p>
                  )}
                </div>

                {/* Join date */}
                <p className="shrink-0 text-xs font-mono text-muted-foreground/60">{joinDate}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
