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
  { id: 4, label: 'Review',           sublabel: 'Admin evaluates',       statuses: ['reviewing'] },
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
    <div className="bg-[#171717]/90 border border-white/[0.08] rounded-[20px] p-6 h-full shadow-xl shadow-black/25 hover:border-white/[0.15] transition-all duration-300">
      <h2 className="font-serif text-xl font-semibold tracking-tight text-white mb-2">Exhibition Lifecycle</h2>
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
                  'relative z-10 shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 shadow-md',
                  isCompleted && 'bg-emerald-500/10 border-emerald-500 text-emerald-400',
                  isCurrent   && 'bg-[#C9A227]/20 border-[#C9A227] text-[#C9A227] ring-4 ring-[#C9A227]/20 font-bold scale-105',
                  isFuture    && 'bg-[#222222] border-white/10 text-white/30'
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isFuture && !isCurrent ? (
                    <Lock className="w-3.5 h-3.5 text-white/20" />
                  ) : (
                    stage.id
                  )}
                </div>

                {/* Content */}
                <div className={cn(
                  'flex-1 pb-3.5 min-w-0 transition-opacity duration-300',
                  isFuture && 'opacity-35',
                  isCurrent && 'opacity-100',
                  isCompleted && 'opacity-75'
                )}>
                  <p className={cn('text-sm font-semibold leading-none', 
                    isCurrent ? 'text-[#C9A227] font-bold' : isCompleted ? 'text-white/90' : 'text-white/60'
                  )}>
                    {stage.label}
                  </p>
                  <p className="text-[11px] text-white/50 mt-1">{stage.sublabel}</p>
                  {isCurrent && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/30">
                      Active Stage
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
