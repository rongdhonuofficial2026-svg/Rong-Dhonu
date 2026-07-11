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
    <div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-4 px-2 sm:px-0">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 text-charcoal tracking-tight">
            {locale === 'bn' ? 'বিজ্ঞপ্তি' : 'Notifications'}
          </h1>
          <p className="text-sm sm:text-base text-[#6B655C]">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={handleMarkAllRead} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] rounded-full gap-2 border-[#E5E0D8] text-charcoal hover:bg-[#F5F2EB] hover:text-charcoal active:scale-95 transition-all">
              <Check className="w-4 h-4" />
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="bg-[#FAF9F6] border border-[#E5E0D8]/60 rounded-3xl md:rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#E5E0D8]/60">
            <Bell className="w-8 h-8 text-[#E5E0D8]" />
          </div>
          <p className="font-serif text-xl text-charcoal font-bold mb-2">No notifications yet</p>
          <p className="text-sm text-[#6B655C] max-w-xs mx-auto leading-relaxed">
            You'll see updates about your artwork submissions here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E0D8]/60 rounded-3xl md:rounded-2xl shadow-sm overflow-hidden divide-y divide-[#E5E0D8]/60">
          {notifications.map(note => (
            <div
              key={note.id}
              className={`p-5 sm:p-6 flex gap-4 transition-colors cursor-pointer group ${
                !note.read_status
                  ? 'bg-[#FAF9F6] hover:bg-[#F5F2EB]'
                  : 'bg-white hover:bg-[#FAF9F6]'
              }`}
            >
              <div className="shrink-0 mt-0.5 w-10 h-10 rounded-full bg-white border border-[#E5E0D8]/60 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                {getIcon(note.type)}
              </div>
              <div className="flex-grow min-w-0">
                <p className={`text-[15px] sm:text-base leading-relaxed ${!note.read_status ? 'font-semibold text-charcoal' : 'font-medium text-charcoal/80'}`}>
                  {locale === 'bn' ? note.message_bn : note.message_en}
                </p>
                <p className="text-xs font-medium text-[#6B655C] mt-2 tracking-wide uppercase">
                  {new Date(note.created_at).toLocaleString(
                    locale === 'bn' ? 'bn-BD' : 'en-US',
                    { dateStyle: 'medium', timeStyle: 'short' }
                  )}
                </p>
              </div>
              {!note.read_status && (
                <div className="shrink-0 pt-2">
                  <span className="block w-2.5 h-2.5 rounded-full bg-accent-gold shadow-sm" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
