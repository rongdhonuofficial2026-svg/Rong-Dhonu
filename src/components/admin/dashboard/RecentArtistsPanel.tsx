import type { DashboardData } from '@/types/dashboard'
import Image from 'next/image'
import { Link } from '@/lib/i18n/routing'
import { User } from 'lucide-react'

interface RecentArtistsPanelProps {
  artists: DashboardData['recentArtists']
}

export function RecentArtistsPanel({ artists }: RecentArtistsPanelProps) {
  return (
    <div className="bg-[#171717]/90 border border-white/[0.08] rounded-[20px] p-6 h-full shadow-xl shadow-black/25 hover:border-white/[0.15] transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-semibold tracking-tight text-white">New Artists</h2>
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
        <div className="space-y-2">
          {artists.map((artist) => {
            const initial = (artist.full_name_en ?? 'A').charAt(0).toUpperCase()
            const joinDate = new Date(artist.created_at || new Date().toISOString()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            return (
              <div key={artist.id} className="flex items-center gap-3.5 py-3 px-3 -mx-3 rounded-xl transition-all duration-300 hover:bg-white/[0.02] group">
                {/* Avatar */}
                <div className="shrink-0 relative w-10 h-10 rounded-full overflow-hidden border border-white/[0.1] bg-white/5 group-hover:border-[#C9A227]/40 transition-colors duration-300">
                  {artist.avatar_url ? (
                    <Image src={artist.avatar_url} alt={artist.full_name_en ?? 'Artist'} fill sizes="40px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif font-bold text-white/50 text-sm bg-gradient-to-br from-[#C9A227]/10 to-transparent">
                      {initial}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white group-hover:text-[#C9A227] transition-colors truncate">
                    {artist.full_name_en || 'Unnamed Artist'}
                  </p>
                  <p className="text-[11px] text-white/55 truncate mt-0.5">
                    {artist.bio_en || 'Member Artist'}
                  </p>
                </div>

                {/* Join date */}
                <div className="shrink-0 text-right">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">{joinDate}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
