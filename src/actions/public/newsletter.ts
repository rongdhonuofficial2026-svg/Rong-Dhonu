'use server'

import { newsletterSubscriptionSchema } from '@/lib/validations/schemas'
import { sendEmail } from '@/lib/email/client'
import { newsletterWelcomeTemplate, newsletterAdminNotification } from '@/lib/email/templates'
import { logAudit } from '@/lib/audit'
import { createClient } from '@/lib/supabase/server'

export interface NewsletterFormInput {
  email: string
  sourcePage: 'homepage' | 'footer' | 'contact' | 'future expansion'
  locale: string
}

export async function subscribeToNewsletter(rawData: NewsletterFormInput) {
  const locale = rawData.locale
  try {
    // 1. Validate inputs server-side
    const validated = newsletterSubscriptionSchema.safeParse(rawData)
    if (!validated.success) {
      const errorMsg = validated.error.issues[0]?.message || 'Validation failed'
      return { error: errorMsg }
    }

    const { email, sourcePage } = validated.data
    const supabase = await createClient()

    // 2. Insert into newsletter_subscribers
    const { data: newSubscriber, error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        source_page: sourcePage,
        locale,
        status: 'subscribed'
      })
      .select('id')
      .single()

    if (dbError) {
      // Catch unique index violation (Postgres error code 23505)
      if (dbError.code === '23505') {
        return { 
          error: locale === 'bn' 
            ? 'এই ইমেইল ঠিকানাটি ইতিমধ্যে নিউজলেটারে সাবস্ক্রাইব করা হয়েছে।' 
            : 'This email address is already subscribed to our newsletter.' 
        }
      }
      console.error('Database newsletter insert error:', dbError)
      return { 
        error: locale === 'bn' 
          ? 'সাবস্ক্রিপশন সম্পন্ন করা যায়নি। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।' 
          : 'Failed to subscribe. Please try again in a few moments.' 
      }
    }

    const adminRecipient = process.env.ADMIN_EMAIL || 'rongdhonuofficial2026@gmail.com'

    // 3. Send welcome confirmation email to subscriber
    const welcomeHtml = newsletterWelcomeTemplate(locale)
    const welcomeRes = await sendEmail({
      to: email,
      subject: locale === 'bn' ? 'রংধনু নিউজলেটারে আপনাকে স্বাগতম' : 'Welcome to Rongdhono',
      html: welcomeHtml
    })

    if (!welcomeRes.success) {
      console.error('Failed to deliver newsletter welcome email:', welcomeRes.error)
      return { error: locale === 'bn' ? 'আমরা এই মুহূর্তে নিউজলেটার নিশ্চিতকরণ ইমেল পাঠাতে পারছি না। অনুগ্রহ করে পরে চেষ্টা করুন।' : "We couldn't send the welcome confirmation email. Please try again later." }
    }

    // 4. Send administrative notification email
    const adminHtml = newsletterAdminNotification(email, sourcePage, locale)
    const adminRes = await sendEmail({
      to: adminRecipient,
      subject: `New Newsletter Subscriber: ${email}`,
      html: adminHtml
    })

    if (!adminRes.success) {
      console.error('Failed to deliver newsletter admin notification:', adminRes.error)
      return { error: locale === 'bn' ? 'নিউজলেটার সাবস্ক্রিপশন সম্পন্ন করা যায়নি। অনুগ্রহ করে পরে চেষ্টা করুন।' : "We couldn't send the admin notification email. Please try again later." }
    }

    // 5. Log transaction inside database audit logs (fire and forget)
    if (newSubscriber) {
      await logAudit(
        'subscribe_newsletter',
        'newsletter_subscribers',
        newSubscriber.id,
        { email, sourcePage }
      ).catch(err => console.warn('Failed to log audit details for newsletter subscription:', err))
    }

    return { success: true }
  } catch (error: any) {
    console.error('subscribeToNewsletter server action exception:', error)
    return { 
      error: locale === 'bn' 
        ? 'একটি ত্রুটি ঘটেছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।' 
        : 'An unexpected error occurred. Please try again later.' 
    }
  }
}
