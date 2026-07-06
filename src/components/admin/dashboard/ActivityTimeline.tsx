'use client'

import { useState } from 'react'
import type { AuditLogWithProfile } from '@/types/dashboard'
import { Activity, Plus, Edit, Trash2, CheckCircle, XCircle, BookOpen, FileText, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityTimelineProps {
  audits: AuditLogWithProfile[]
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)    return 'just now'
  if (mins < 60)   return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days === 1)  return 'yesterday'
  return `${days}d ago`
}

type ActionStyle = { icon: React.ElementType; color: string; bg: string }

function getActionStyle(action: string): ActionStyle {
  const a = action.toLowerCase()
  if (a.startsWith('create') || a.includes('create'))        return { icon: Plus,         color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
  if (a.startsWith('update') || a.includes('update'))        return { icon: Edit,         color: 'text-blue-400',    bg: 'bg-blue-500/10' }
  if (a.includes('delete') || a.includes('remove'))          return { icon: Trash2,       color: 'text-rose-400',    bg: 'bg-rose-500/10' }
  if (a.includes('approve'))                                 return { icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
  if (a.includes('reject'))                                  return { icon: XCircle,      color: 'text-rose-400',    bg: 'bg-rose-500/10' }
  if (a.includes('catalog') || a.includes('publish'))        return { icon: BookOpen,     color: 'text-accent',      bg: 'bg-accent/10' }
  if (a.includes('cms') || a.includes('content'))            return { icon: FileText,     color: 'text-cyan-400',    bg: 'bg-cyan-500/10' }
  if (a.includes('archive'))                                 return { icon: Archive,      color: 'text-amber-400',   bg: 'bg-amber-500/10' }
  return { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted/30' }
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export function ActivityTimeline({ audits }: ActivityTimelineProps) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? audits : audits.slice(0, 8)

  return (
    <div className="bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-serif text-xl font-semibold tracking-tight">Recent Activity</h2>
        </div>
        {audits.length > 8 && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="text-xs text-accent hover:text-accent/80 font-medium transition-colors"
          >
            {showAll ? 'Show less' : `Show all ${audits.length}`}
          </button>
        )}
      </div>

      {audits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
            <Activity className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="font-medium text-foreground">The halls are quiet.</p>
          <p className="text-sm text-muted-foreground mt-1">No activity recorded yet.</p>
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Vertical timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border/40 dark:bg-white/5" />

          {visible.map((log, i) => {
            const style = getActionStyle(log.action)
            const Icon  = style.icon
            const actorName = log.profiles?.full_name_en || 'System'
            const initial   = actorName.charAt(0).toUpperCase()

            return (
              <div key={log.id} className={cn('relative flex gap-4 py-3', i < visible.length - 1 && 'border-b border-border/20 dark:border-white/5')}>
                {/* Timeline dot */}
                <div className={cn('relative z-10 shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-white/20 dark:border-white/10', style.bg)}>
                  <Icon className={cn('w-3.5 h-3.5', style.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground">{actorName}</span>
                      <span className="text-sm text-muted-foreground"> · </span>
                      <span className="text-sm text-muted-foreground">{formatAction(log.action)}</span>
                      {log.entity_type && (
                        <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground font-mono">
                          {log.entity_type}
                        </span>
                      )}
                    </div>
                    <time className="shrink-0 text-xs font-mono text-muted-foreground/60">
                      {getRelativeTime(log.created_at || new Date().toISOString())}
                    </time>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
