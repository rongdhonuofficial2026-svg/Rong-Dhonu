import { createClient } from '@/lib/supabase/server'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html }
    })
    
    if (error) {
      console.error('Edge function send-email failed:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, data }
  } catch (err: any) {
    console.error('Failed to invoke send-email edge function:', err)
    return { success: false, error: err.message || 'Unknown email invocation error' }
  }
}
