'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type NotificationType = Database['public']['Tables']['notifications']['Row']['type']

export async function createNotification(
  userId: string,
  type: NotificationType,
  messageEn: string,
  messageBn: string,
  emailData?: { subject: string; html: string; category?: string }
) {
  try {
    const supabase = await createClient()
    
    // 1. Fetch user preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, notify_in_app, notify_email, notify_exhibition_announcements, notify_deadline_reminders, notify_artwork_updates')
      .eq('id', userId)
      .single()

    if (!profile) return false

    // 2. Insert In-App Notification (if preference is true)
    if (profile.notify_in_app !== false) {
      await supabase.from('notifications').insert({
        user_id: userId,
        type,
        message_en: messageEn,
        message_bn: messageBn,
        read_status: false
      })
    }

    // 3. Send Email (if preferences and emailData allow)
    if (emailData && profile.notify_email !== false && profile.email) {
      // Check specific category preference
      let categoryAllowed = true
      if (emailData.category && emailData.category in profile) {
        categoryAllowed = (profile as Record<string, any>)[emailData.category] !== false
      }
      
      if (categoryAllowed) {
        // Trigger Edge Function (fire and forget — don't await to avoid blocking)
        supabase.functions.invoke('send-email', {
          body: {
            to: profile.email,
            subject: emailData.subject,
            html: emailData.html
          }
        }).catch(err => console.warn('Email send failed (non-blocking):', err))
      }
    }

    return true
  } catch (error) {
    console.error('Failed to create notification:', error)
    return false
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('notifications').update({ read_status: true })
    .eq('id', notificationId)
    .eq('user_id', user.id)
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('notifications').update({ read_status: true })
      .eq('user_id', user.id)
      .eq('read_status', false)
  }
}
