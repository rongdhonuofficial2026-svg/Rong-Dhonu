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
    high:   'border-rose-500/30 bg-rose-500/5 text-rose-400',
    medium: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    low:    'border-blue-500/30 bg-blue-500/5 text-blue-400',
  }

  const PRIORITY_BADGE = {
    high:   'bg-rose-500/20 text-rose-400',
    medium: 'bg-amber-500/20 text-amber-400',
    low:    'bg-blue-500/20 text-blue-400',
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
          <p className="font-medium text-foreground">All clear</p>
          <p className="text-sm text-muted-foreground mt-1">No outstanding tasks require attention.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action, i) => {
            const Icon = action.icon
            return (
              <Link key={i} href={action.href as any}>
                <div className={cn(
                  'group flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5',
                  PRIORITY_STYLES[action.priority]
                )}>
                  <div className={cn('p-2 rounded-lg shrink-0', PRIORITY_BADGE[action.priority].replace('text-', 'bg-').replace('400', '400/10'))}>
                    <Icon className={cn('w-4 h-4', PRIORITY_BADGE[action.priority].split(' ')[1])} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{action.label}</p>
                      {action.count > 0 && (
                        <span className={cn('shrink-0 text-xs font-bold px-2 py-0.5 rounded-full', PRIORITY_BADGE[action.priority])}>
                          {action.count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{action.description}</p>
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
