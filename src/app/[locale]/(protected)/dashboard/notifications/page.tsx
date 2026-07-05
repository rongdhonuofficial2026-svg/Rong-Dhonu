import { createClient } from '@/lib/supabase/server'
import { Bell, Check, CalendarClock, BookOpen, AlertCircle, ThumbsUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markAllNotificationsAsRead } from '@/actions/notifications'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export default async function NotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  async function handleMarkAllRead() {
    'use server'
    await markAllNotificationsAsRead()
    revalidatePath(`/[locale]/(protected)/dashboard/notifications`, 'page')
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'submission_approved': return <ThumbsUp className="w-5 h-5 text-green-500" />
      case 'submission_rejected': return <X className="w-5 h-5 text-red-500" />
      case 'catalog_published': return <BookOpen className="w-5 h-5 text-blue-500" />
      case 'deadline_reminder': return <CalendarClock className="w-5 h-5 text-orange-500" />
      case 'new_exhibition': return <CalendarClock className="w-5 h-5 text-purple-500" />
      default: return <Bell className="w-5 h-5 text-muted-foreground" />
    }
  }

  const unreadCount = notifications?.filter(n => !n.read_status).length || 0

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {locale === 'bn' ? 'বিজ্ঞপ্তি' : 'Notifications'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={handleMarkAllRead}>
            <Button variant="outline" size="sm" className="gap-2">
              <Check className="w-4 h-4" />
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        {!notifications || notifications.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">No notifications yet.</p>
            <p className="text-sm mt-1">You'll see updates about your artwork submissions here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map(note => (
              <div
                key={note.id}
                className={`p-5 flex gap-4 transition-colors ${
                  !note.read_status
                    ? 'bg-accent/5 hover:bg-accent/10'
                    : 'opacity-60 hover:opacity-80'
                }`}
              >
                <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  {getIcon(note.type)}
                </div>
                <div className="flex-grow min-w-0">
                  <p className={`text-sm leading-relaxed ${!note.read_status ? 'font-medium' : ''}`}>
                    {locale === 'bn' ? note.message_bn : note.message_en}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {new Date(note.created_at).toLocaleString(
                      locale === 'bn' ? 'bn-BD' : 'en-US',
                      { dateStyle: 'medium', timeStyle: 'short' }
                    )}
                  </p>
                </div>
                {!note.read_status && (
                  <div className="shrink-0 self-center">
                    <span className="block w-2.5 h-2.5 rounded-full bg-accent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
