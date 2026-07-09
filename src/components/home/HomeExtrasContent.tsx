'use client'

import { useState } from "react"
import { subscribeToNewsletter } from "@/actions/public/newsletter"
import { toast } from "sonner"

export function HomeNewsletterContent({ locale, content }: { locale: string, content: any }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const title = content?.title || (locale === 'bn' ? "আমাদের যাত্রায় যোগ দিন" : "Join Our Artistic Journey")
  const description = content?.description || (locale === 'bn'
    ? 'প্রদর্শনী, শিল্পী সাক্ষাৎকার এবং বিশেষ সংগ্রহে আর্লি অ্যাক্সেস পেতে সাবস্ক্রাইব করুন।'
    : 'Subscribe for updates on upcoming exhibitions, new member artists, and stories from the studio.')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    try {
      const res = await subscribeToNewsletter({
        email,
        sourcePage: 'homepage',
        locale
      })

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(locale === 'bn' ? 'নিউজলেটার সাবস্ক্রিপশন সফল হয়েছে!' : 'Subscribed successfully!')
        setEmail('')
      }
    } catch {
      toast.error(locale === 'bn' ? 'একটি ত্রুটি ঘটেছে।' : 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="newsletter reveal" id="newsletter">
      <div className="newsletter-bg">
        <div className="newsletter-inner">
          <h2 dangerouslySetInnerHTML={{ __html: title }} />
          <p>{description}</p>
          
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder={locale === 'bn' ? 'আপনার ইমেইল ঠিকানা' : 'Your email address'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <button type="submit" className="btn btn-paper magnetic" disabled={loading}>
              {loading ? (locale === 'bn' ? '...' : '...') : (locale === 'bn' ? 'যুক্ত হোন' : 'Subscribe')}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
