import type { DashboardData } from '@/types/dashboard'
import { Calendar, MapPin, User } from 'lucide-react'

interface UpcomingEventsProps {
  events: DashboardData['upcomingEvents']
}

function formatEventDate(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr)
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <div className="bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <h2 className="font-serif text-xl font-semibold tracking-tight">Upcoming Events</h2>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mb-3">
            <Calendar className="w-6 h-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-foreground">No upcoming events</p>
          <p className="text-xs text-muted-foreground mt-1">Schedule events through the Exhibitions section.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const { date, time } = formatEventDate(event.date_time)
            return (
              <div key={event.id} className="flex gap-4 group">
                {/* Date badge */}
                <div className="shrink-0 w-12 flex flex-col items-center justify-start pt-0.5">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex flex-col items-center justify-center">
                    <span className="text-[8px] font-bold uppercase text-accent/70 leading-none">
                      {date.split(' ')[1]}
                    </span>
                    <span className="text-sm font-bold text-accent leading-none mt-0.5">
                      {date.split(' ')[2]}
                    </span>
                  </div>
                </div>

                {/* Event info */}
                <div className="flex-1 min-w-0 border-b border-border/30 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                  <p className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                    {event.title_en}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground font-mono">{time}</span>
                    {event.speaker_en && (
                      <>
                        <span className="text-muted-foreground/30">·</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {event.speaker_en}
                        </span>
                      </>
                    )}
                  </div>
                  {event.description_en && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 opacity-70">{event.description_en}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
