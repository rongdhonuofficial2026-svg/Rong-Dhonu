'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HomeNewsletterContent({ locale, content }: { locale: string, content: any }) {
  const title = content?.title || (locale === 'bn' ? "আমাদের যাত্রায় যোগ দিন" : "Join Our Artistic Journey")
  const description = content?.description || (locale === 'bn'
    ? 'প্রদর্শনী, শিল্পী সাক্ষাৎকার এবং বিশেষ সংগ্রহে আর্লি অ্যাক্সেস পেতে সাবস্ক্রাইব করুন।'
    : 'Subscribe for updates on upcoming exhibitions, new member artists, and stories from the studio.')

  return (
    <section className="newsletter reveal" id="newsletter">
      <div className="newsletter-bg">
        <div className="newsletter-inner">
          <h2 dangerouslySetInnerHTML={{ __html: title }} />
          <p>{description}</p>
          
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder={locale === 'bn' ? 'আপনার ইমেইল ঠিকানা' : 'Your email address'}
              required
            />
            <button type="submit" className="btn btn-paper magnetic">
              {locale === 'bn' ? 'যুক্ত হোন' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
