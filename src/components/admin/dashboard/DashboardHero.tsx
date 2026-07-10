import type { ExhibitionRow, ProfileRow } from '@/types/dashboard'
import { ClientSideCountdown } from './ClientSideCountdown'
import { Palette, User, Wifi, Sparkles } from 'lucide-react'
import { Link } from '@/lib/i18n/routing'

interface DashboardHeroProps {
  currentUser: Pick<ProfileRow, 'full_name_en' | 'role' | 'avatar_url'>
  activeExhibition: ExhibitionRow | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:             { label: 'Draft',              color: 'bg-white/10 text-white/60 border-white/10' },
  registration_open: { label: 'Registration Open',  color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  submission_open:   { label: 'Submission Open',    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  submission_closed: { label: 'Submissions Closed', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  reviewing:         { label: 'Under Review',       color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  published:         { label: 'Published & Live',   color: 'bg-accent/20 text-accent border-accent/30' },
  archived:          { label: 'Archived',           color: 'bg-white/5 text-white/40 border-white/5' },
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardHero({ currentUser, activeExhibition }: DashboardHeroProps) {
  const status = activeExhibition?.status
  const statusInfo = status ? STATUS_LABELS[status] : null
  const now = new Date()

  return (
    <section className="relative rounded-3xl overflow-hidden min-h-[280px] md:min-h-[340px] flex flex-col justify-between p-6 md:p-8 lg:p-12 museum-shadow bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#1a1208] border border-white/[0.08]">
      {/* Decorative ambient glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-purple-900/20 blur-3xl" />
        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }}
        />
      </div>

      {/* Top row — system status + date */}
      <div className="relative z-10 flex flex-col gap-3 order-1">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md w-fit">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-medium tracking-widest uppercase text-white/70">System Operational</span>
        </div>
        <div className="text-xs font-mono text-white/40 tracking-wider">
          {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}
          {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 mt-6 md:mt-8 order-2">
        <p className="text-white/50 text-sm font-medium tracking-wide mb-2">
          {getGreeting()}, <span className="text-white/80">{currentUser.full_name_en || 'Administrator'}</span>
        </p>

        {activeExhibition ? (
          <>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-3 text-shadow-elegant">
              {activeExhibition.theme_en}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {statusInfo && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${statusInfo.color}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {statusInfo.label}
                </span>
              )}
              <span className="text-white/40 text-sm font-mono">Exhibition {activeExhibition.year}</span>
              {activeExhibition.venue_en && (
                <span className="text-white/40 text-sm">· {activeExhibition.venue_en}</span>
              )}
            </div>
            {activeExhibition.exhibition_start && (
              <ClientSideCountdown targetDate={activeExhibition.exhibition_start} />
            )}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/admin/cms"
                className="w-full sm:w-auto min-h-11 px-6 h-11 inline-flex items-center justify-center text-xs font-semibold tracking-wider uppercase rounded-xl border border-accent bg-[#C9A227] text-black hover:bg-[#b08d22] transition-all duration-300 shadow-[0_4px_14px_rgba(201,162,39,0.35)]"
              >
                Open Content Studio
              </Link>
              <Link
                href="/admin/artworks"
                className="w-full sm:w-auto min-h-11 px-6 h-11 inline-flex items-center justify-center text-xs font-semibold tracking-wider uppercase rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                Review Submissions
              </Link>
            </div>
          </>
        ) : (
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white/50 leading-tight mb-2">
              No Active Exhibition
            </h1>
            <p className="text-white/40 text-sm">
              Create a new exhibition to begin the administrative cycle.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/exhibitions/new"
                className="w-full sm:w-auto min-h-11 px-6 h-11 inline-flex items-center justify-center text-xs font-semibold tracking-wider uppercase rounded-xl border border-[#C9A227] bg-[#C9A227]/10 text-[#C9A227] hover:bg-[#C9A227] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(200,169,106,0.15)]"
              >
                Create Exhibition
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom row — admin info */}
      <div className="relative z-10 mt-6 md:mt-8 pt-6 border-t border-white/10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between order-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
            {currentUser.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-accent" />
            )}
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest">Logged in as</p>
            <p className="text-sm font-semibold text-white/80">{currentUser.full_name_en || 'Administrator'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30 font-mono">
          <Palette className="w-3.5 h-3.5" />
          <span>Rongdhono Administrative OS · v1.0</span>
        </div>
      </div>
    </section>
  )
}
