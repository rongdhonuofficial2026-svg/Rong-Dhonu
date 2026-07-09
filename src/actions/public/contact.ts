'use server'

import { contactInquirySchema } from '@/lib/validations/schemas'
import { sendEmail } from '@/lib/email/client'
import { adminInquiryTemplate, userAutoReplyTemplate } from '@/lib/email/templates'
import { logAudit } from '@/lib/audit'
import { createClient } from '@/lib/supabase/server'

export interface ContactFormInput {
  inquiryType: string
  name: string
  email: string
  subject: string
  message: string
}

export async function submitInquiry(locale: string, rawData: ContactFormInput) {
  try {
    // 1. Validate inputs server-side
    const validated = contactInquirySchema.safeParse(rawData)
    if (!validated.success) {
      const errorMsg = validated.error.issues[0]?.message || 'Validation failed'
      return { error: errorMsg }
    }

    const { inquiryType, name, email, subject, message } = validated.data

    const adminRecipient = process.env.ADMIN_EMAIL || 'rongdhonuofficial2026@gmail.com'

    // 2. Send detailed notification email to the administrator inbox
    const adminHtml = adminInquiryTemplate({ inquiryType, name, email, subject, message })
    const adminRes = await sendEmail({
      to: adminRecipient,
      subject: `New Contact Inquiry: ${subject}`,
      html: adminHtml
    })

    if (!adminRes.success) {
      console.error('Failed to deliver inquiry email to admin:', adminRes.error)
      return { error: locale === 'bn' ? 'আমরা এই মুহূর্তে আপনার বার্তা পাঠাতে পারছি না। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।' : "We couldn't send your message right now. Please try again in a few moments." }
    }

    // 3. Send automated confirmation/auto-reply email to the customer
    const userHtml = userAutoReplyTemplate(name, subject, locale)
    const userRes = await sendEmail({
      to: email,
      subject: locale === 'bn' ? 'যোগাযোগের জন্য ধন্যবাদ' : 'Inquiry Received - Rongdhono',
      html: userHtml
    })

    if (!userRes.success) {
      console.error('Failed to deliver auto-reply email to visitor:', userRes.error)
      return { error: locale === 'bn' ? 'আমরা এই মুহূর্তে নিশ্চিতকরণ ইমেল পাঠাতে পারছি না। অনুগ্রহ করে পরে চেষ্টা করুন।' : "We couldn't send the confirmation email. Please try again later." }
    }

    // 4. Log transaction inside database audit logs (fire and forget, safety caught)
    try {
      const supabase = await createClient()
      const { data: newNotification, error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: null, // Anonymous contact
          type: 'submission_received',
          message_en: `Anonymous inquiry received regarding: ${subject}`,
          message_bn: `যোগাযোগের বিষয়: ${subject}`,
          read_status: false
        })
        .select('id')
        .single()

      if (!notifError && newNotification) {
        await logAudit(
          'submit_inquiry',
          'notifications',
          newNotification.id,
          { email, subject, inquiryType }
        )
      }
    } catch (auditErr) {
      console.warn('Failed to log audit details for inquiry:', auditErr)
    }

    return { success: true }
  } catch (error: any) {
    console.error('submitInquiry server action exception:', error)
    return { error: locale === 'bn' ? 'একটি ত্রুটি ঘটেছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।' : 'An unexpected error occurred. Please try again later.' }
  }
}
