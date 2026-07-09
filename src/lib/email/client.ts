import { createClient } from '@/lib/supabase/server'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const timestamp = new Date().toISOString()
  try {
    console.log(`[Email Audit] [${timestamp}] Attempting email dispatch to: ${to}, subject: "${subject}"`)
    const supabase = await createClient()
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html }
    })
    
    if (error) {
      console.error(`[Email Audit] [${timestamp}] Edge function invocation error for recipient: ${to}:`, error)
      return { success: false, error: error.message }
    }
    
    if (data && data.success === false) {
      console.error(`[Email Audit] [${timestamp}] send-email reported dispatch error for recipient: ${to}:`, data.error)
      return { success: false, error: data.error?.message || 'Email transmission rejected by provider' }
    }
    
    console.log(`[Email Audit] [${timestamp}] Email dispatch succeeded for recipient: ${to}. Data:`, data)
    return { success: true, data }
  } catch (err: any) {
    console.error(`[Email Audit] [${timestamp}] sendEmail caught execution exception for recipient: ${to}:`, err)
    return { success: false, error: err.message || 'Unknown email client execution error' }
  }
}
