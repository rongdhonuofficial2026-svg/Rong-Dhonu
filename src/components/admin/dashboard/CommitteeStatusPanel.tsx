import type { CommitteeMemberFull } from '@/types/dashboard'
import Image from 'next/image'
import { Link } from '@/lib/i18n/routing'
import { Shield } from 'lucide-react'

interface CommitteeStatusPanelProps {
  members: CommitteeMemberFull[]
}

export function CommitteeStatusPanel({ members }: CommitteeStatusPanelProps) {
  // Dedupe by profile_id (member may appear in multiple exhibitions)
  const seen = new Set<string>()
  const unique = members.filter(m => {
    const pid = (m as any).profiles?.full_name_en ?? m.id
    if (seen.has(pid)) return false
    seen.add(pid)
    return true
  })

  return (
    <div className="bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-serif text-xl font-semibold tracking-tight">Committee</h2>
        </div>
        <Link href="/admin/committee" className="text-xs text-accent hover:text-accent/80 font-medium transition-colors">
          Manage →
        </Link>
      </div>

      {unique.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Shield className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No committee members assigned.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {unique.slice(0, 6).map((member) => {
            const name    = member.profiles?.full_name_en ?? 'Unknown'
            const avatar  = member.profiles?.avatar_url
            const initial = name.charAt(0).toUpperCase()
            return (
              <div key={member.id} className="flex items-center gap-3 group">
                {/* Avatar */}
                <div className="shrink-0 relative w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-indigo-500/10">
                  {avatar ? (
                    <Image src={avatar} alt={name} fill sizes="36px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif font-bold text-indigo-400 text-sm">
                      {initial}
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.role_en}</p>
                </div>
                {/* Year badge */}
                <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-muted/30 text-muted-foreground">
                  {member.exhibitions?.theme_en ? member.exhibitions.theme_en.slice(0, 12) : member.year}
                </span>
              </div>
            )
          })}
          {unique.length > 6 && (
            <p className="text-xs text-muted-foreground pt-1 text-center">+{unique.length - 6} more members</p>
          )}
        </div>
      )}
    </div>
  )
}
