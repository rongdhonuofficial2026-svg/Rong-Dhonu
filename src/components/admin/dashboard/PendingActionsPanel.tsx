import type { DashboardKPIs } from '@/types/dashboard'
import { Link } from '@/lib/i18n/routing'
import { AlertCircle, Clock, BookOpen, Paintbrush, Users, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PendingActionsPanelProps {
  kpis: DashboardKPIs
}

interface PendingAction {
  label: string
  count: number
  priority: 'high' | 'medium' | 'low'
  href: string
  icon: React.ElementType
  description: string
}

export function PendingActionsPanel({ kpis }: PendingActionsPanelProps) {
  const actions: PendingAction[] = []

  if (kpis.pendingArtworks > 0) {
    actions.push({
      label: 'Artworks Awaiting Moderation',
      count: kpis.pendingArtworks,
      priority: 'high',
      href: '/admin/artworks',
      icon: AlertCircle,
      description: 'Artists are waiting for feedback on their submissions.',
    })
  }

  if (kpis.pendingParticipants > 0) {
    actions.push({
      label: 'Exhibition Registrations Pending',
      count: kpis.pendingParticipants,
      priority: 'high',
      href: '/admin/exhibitions',
      icon: Users,
      description: 'Artists have applied to participate and await approval.',
    })
  }

  if (kpis.draftCatalogs > 0) {
    actions.push({
      label: 'Catalogs Unpublished',
      count: kpis.draftCatalogs,
      priority: 'medium',
      href: '/admin/catalogs',
      icon: BookOpen,
      description: 'Catalog drafts are ready to review and publish.',
    })
  }

  if (kpis.activeExhibitions === 0) {
    actions.push({
      label: 'No Active Exhibition',
      count: 0,
      priority: 'medium',
      href: '/admin/exhibitions/new',
      icon: Paintbrush,
      description: 'Create a new exhibition to open the registration cycle.',
    })
  }

  const PRIORITY_STYLES = {
    high:   'border border-white/[0.04] border-l-4 border-l-rose-500 bg-rose-950/20 text-rose-300 hover:border-l-rose-400 hover:bg-rose-950/30',
    medium: 'border border-white/[0.04] border-l-4 border-l-amber-500 bg-amber-950/15 text-amber-300 hover:border-l-amber-400 hover:bg-amber-950/25',
    low:    'border border-white/[0.04] border-l-4 border-l-blue-500 bg-blue-950/15 text-blue-300 hover:border-l-blue-400 hover:bg-blue-950/25',
  }

  const PRIORITY_BADGE = {
    high:   'bg-rose-500/25 text-rose-200 border border-rose-500/30',
    medium: 'bg-amber-500/25 text-amber-200 border border-amber-500/30',
    low:    'bg-blue-500/25 text-blue-200 border border-blue-500/30',
  }

  return (
    <div className="bg-[#171717]/90 border border-white/[0.08] rounded-[20px] p-6 h-full shadow-xl shadow-black/25 hover:border-white/[0.15] transition-all duration-300">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-white/50" />
        <h2 className="font-serif text-xl font-semibold tracking-tight text-white">Pending Actions</h2>
        {actions.length > 0 && (
          <span className="ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {actions.length}
          </span>
        )}
      </div>

      {actions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="font-medium text-white">All clear</p>
          <p className="text-xs text-white/50 mt-1">No outstanding tasks require attention.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action, i) => {
            const Icon = action.icon
            return (
              <Link key={i} href={action.href as any} className="block focus:outline-none rounded-xl">
                <div className={cn(
                  'group flex items-start gap-3.5 p-4 rounded-xl transition-all duration-200 shadow-md',
                  PRIORITY_STYLES[action.priority]
                )}>
                  <div className="p-2 rounded-lg shrink-0 bg-white/5 border border-white/[0.06] group-hover:scale-105 transition-transform duration-200">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white tracking-wide">{action.label}</p>
                      {action.count > 0 && (
                        <span className={cn('shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider', PRIORITY_BADGE[action.priority])}>
                          {action.count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-1 line-clamp-2 leading-relaxed">{action.description}</p>
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
