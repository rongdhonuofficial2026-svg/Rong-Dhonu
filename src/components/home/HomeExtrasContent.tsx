'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HomeNewsletterContent({ locale, content }: { locale: string, content: any }) {
  const title = content?.title || (locale === 'bn' ? "আমাদের যাত্রায় <em>যোগ দিন</em>" : "Stay in the <em>Flow</em>")
  const description = content?.description || (locale === 'bn'
    ? 'প্রদর্শনী, শিল্পী সাক্ষাৎকার এবং বিশেষ সংগ্রহে আর্লি অ্যাক্সেস পেতে সাবস্ক্রাইব করুন।'
    : 'Subscribe for early access to exhibitions, artist interviews, and curated collections.')

  return (
    <section className="newsletter" id="newsletter">
      <div className="newsletter-inner reveal in">
        <div className="eyebrow">
          {locale === 'bn' ? 'নিউজলেটার' : 'Newsletter'}
        </div>
        <h2 dangerouslySetInnerHTML={{ __html: title }} />
        <p>{description}</p>
        
        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder={locale === 'bn' ? 'আপনার ইমেইল ঠিকানা' : 'Your email address'}
            required
          />
          <button type="submit" className="btn btn-gold magnetic">
            {locale === 'bn' ? 'যুক্ত হোন' : 'Subscribe'}
          </button>
        </form>
        
        <div className="fine-print">
          {locale === 'bn' 
            ? 'আমরা আপনার ইনবক্সকে সম্মান করি। যেকোনো সময় আনসাবস্ক্রাইব করতে পারেন।' 
            : 'We respect your inbox. Unsubscribe anytime.'}
        </div>
      </div>
    </section>
  )
}
