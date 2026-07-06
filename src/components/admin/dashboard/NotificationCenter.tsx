import type { DashboardData } from '@/types/dashboard'
import { Bell, CheckCircle, Star, Inbox, XCircle, Clock, BookOpen, Paintbrush } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationCenterProps {
  notifications: DashboardData['recentNotifications']
}

type NotifType = DashboardData['recentNotifications'][number]['type']

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  registration_approved: { icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  submission_received:   { icon: Inbox,        color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  submission_approved:   { icon: Star,         color: 'text-accent',      bg: 'bg-accent/10' },
  submission_rejected:   { icon: XCircle,      color: 'text-rose-400',    bg: 'bg-rose-500/10' },
  deadline_reminder:     { icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  catalog_published:     { icon: BookOpen,     color: 'text-teal-400',    bg: 'bg-teal-500/10' },
  new_exhibition:        { icon: Paintbrush,   color: 'text-purple-400',  bg: 'bg-purple-500/10' },
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function NotificationCenter({ notifications }: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.read_status).length

  return (
    <div className="bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-muted-foreground" />
        <h2 className="font-serif text-xl font-semibold tracking-tight">Notifications</h2>
        {unreadCount > 0 && (
          <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400">
            {unreadCount} new
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Bell className="w-8 h-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No notifications.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const cfg   = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.submission_received
            const Icon  = cfg.icon
            const isNew = !notif.read_status

            return (
              <div
                key={notif.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl border transition-all duration-200',
                  isNew
                    ? 'bg-accent/5 border-accent/20 dark:border-accent/10'
                    : 'border-transparent hover:bg-muted/10'
                )}
              >
                {isNew && (
                  <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                )}
                <div className={cn('shrink-0 w-8 h-8 rounded-lg flex items-center justify-center', cfg.bg, !isNew && 'opacity-60')}>
                  <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs leading-relaxed line-clamp-2', isNew ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                    {notif.message_en}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">
                    {getRelativeTime(notif.created_at || new Date().toISOString())}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
