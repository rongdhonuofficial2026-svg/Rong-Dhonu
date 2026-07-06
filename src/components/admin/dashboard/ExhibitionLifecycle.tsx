import type { ExhibitionRow } from '@/types/dashboard'
import { cn } from '@/lib/utils'
import { Lock, CheckCircle2 } from 'lucide-react'

interface ExhibitionLifecycleProps {
  activeExhibition: ExhibitionRow | null
}

type Stage = {
  id: number
  label: string
  sublabel: string
  statuses: ExhibitionRow['status'][]
}

const STAGES: Stage[] = [
  { id: 1, label: 'Registration',     sublabel: 'Artists sign up',          statuses: ['registration_open'] },
  { id: 2, label: 'Submission',       sublabel: 'Artworks submitted',        statuses: ['submission_open'] },
  { id: 3, label: 'Closed',           sublabel: 'Submissions locked',        statuses: ['submission_closed'] },
  { id: 4, label: 'Review',           sublabel: 'Committee evaluates',       statuses: ['reviewing'] },
  { id: 5, label: 'Selection',        sublabel: 'Final choices made',        statuses: [] }, // derived
  { id: 6, label: 'Published',        sublabel: 'Public gallery live',       statuses: ['published'] },
  { id: 7, label: 'Archived',         sublabel: 'Exhibition history',        statuses: ['archived'] },
]

function getCurrentStageIndex(status: ExhibitionRow['status'] | undefined): number {
  if (!status) return -1
  if (status === 'draft') return -1
  const found = STAGES.findIndex(s => s.statuses.includes(status))
  // If reviewing, show stage 5 (selection) as "in progress" conceptually
  if (status === 'reviewing') return 4
  if (status === 'published') return 5
  if (status === 'archived') return 6
  return found
}

export function ExhibitionLifecycle({ activeExhibition }: ExhibitionLifecycleProps) {
  const status = activeExhibition?.status
  const currentIdx = getCurrentStageIndex(status)

  return (
    <div className="bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl p-6 h-full">
      <h2 className="font-serif text-xl font-semibold tracking-tight mb-2">Exhibition Lifecycle</h2>
      {activeExhibition ? (
        <p className="text-sm text-muted-foreground mb-6">
          {activeExhibition.theme_en} · {activeExhibition.year}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">No active exhibition</p>
      )}

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-4 top-4 bottom-4 w-px bg-border/50 dark:bg-white/10" />

        <div className="space-y-3">
          {STAGES.map((stage, i) => {
            const isCompleted = i < currentIdx
            const isCurrent   = i === currentIdx
            const isFuture    = i > currentIdx || currentIdx === -1

            return (
              <div key={stage.id} className="relative flex items-start gap-4 pl-0">
                {/* Step indicator */}
                <div className={cn(
                  'relative z-10 shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300',
                  isCompleted && 'bg-accent border-accent text-black',
                  isCurrent   && 'bg-accent/20 border-accent text-accent ring-4 ring-accent/20 animate-pulse',
                  isFuture    && 'bg-background border-border text-muted-foreground'
                )}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isFuture && !isCurrent ? <Lock className="w-3 h-3" /> : stage.id}
                </div>

                {/* Content */}
                <div className={cn(
                  'flex-1 pb-3 min-w-0',
                  isFuture && 'opacity-40'
                )}>
                  <p className={cn('text-sm font-semibold leading-none', isCurrent && 'text-accent')}>{stage.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stage.sublabel}</p>
                  {isCurrent && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-accent/20 text-accent border border-accent/30">
                      Current Stage
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
