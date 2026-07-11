'use client'

import { motion } from "framer-motion"
import Link from "next/link"

export function HomeSponsorsContent({ locale, content }: { locale: string, content: any }) {
  if (!content || !content.logos || content.logos.length === 0) return null

  const title = content.title || (locale === 'bn' ? 'আমাদের সহযোগী প্রতিষ্ঠানসমূহ' : 'Supported By')

  return (
    <section className="partners">
      <div className="partners-inner reveal">
        <div className="partners-label">{title}</div>
        <div className="partners-row">
          {content.logos.map((logo: { name: string, url: string }, i: number) => (
            <span key={i}>{logo.name}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeTestimonialsContent({ locale, content }: { locale: string, content: any }) {
  const title = (content?.title && content.title !== "What They Say" && content.title !== "আমাদের সাথে তাদের অভিজ্ঞতা") 
    ? content.title 
    : (locale === 'bn' ? 'আমাদের সাথে তাদের অভিজ্ঞতা' : 'Voices from our community')

  const defaultItems = [
    {
      author: locale === 'bn' ? 'দেবাশীষ রায়' : 'Debashish Roy',
      role_en: 'Gallery Patron',
      role_bn: 'গ্যালারি পৃষ্ঠপোষক',
      quote_en: 'Rongdhonu is a beacon of light for the artistic community — a rare place where emerging and established artists genuinely learn from one another.',
      quote_bn: 'রংধনু শৈল্পিক সম্প্রদায়ের জন্য আশার আলো — এমন একটি বিরল জায়গা যেখানে উদীয়মান এবং সুপ্রতিষ্ঠিত শিল্পীরা একে অপরের কাছ থেকে সত্যিকারের শিক্ষা পান।'
    },
    {
      author: locale === 'bn' ? 'প্রিয়া সেন' : 'Priya Sen',
      role_en: 'Collector',
      role_bn: 'সংগ্রাহক',
      quote_en: 'The annual exhibition is an unmissable event that beautifully captures the spirit of our times — every year it feels more alive than the last.',
      quote_bn: 'বার্ষিক প্রদর্শনীটি একটি অনবদ্য আয়োজন যা আমাদের সময়ের চেতনাকে চমৎকারভাবে ধারণ করে — প্রতি বছর এটি আগের চেয়ে আরও বেশি প্রাণবন্ত মনে হয়।'
    },
    {
      author: locale === 'bn' ? 'অর্ক মুখার্জী' : 'Arka Mukherjee',
      role_en: 'Member Artist',
      role_bn: 'সদস্য শিল্পী',
      quote_en: 'What sets Rongdhonu apart is how personally the collective invests in every emerging artist — it never feels transactional, always like family.',
      quote_bn: 'রংধনু-কে যা অনন্য করে তোলে তা হলো উদীয়মান শিল্পীদের প্রতি তাদের ব্যক্তিগত যত্ন — এটি কখনো পেশাদারী লেনদেন মনে হয় না, সবসময় একটি পরিবারের মতো।'
    }
  ]

  const items = (content?.items && content.items.length >= 3) ? content.items : defaultItems

  return (
    <section className="testimonials" id="testimonials">
      <div className="testi-head reveal">
        <div className="eyebrow center">{locale === 'bn' ? 'তারা কী বলেন' : 'What They Say'}</div>
        <h2>{title}</h2>
      </div>

      <div className="testi-grid">
        {items.slice(0, 3).map((item: any, i: number) => {
          const quote = locale === 'bn' ? (item.quote_bn || item.quote_en) : item.quote_en
          const role = locale === 'bn' ? (item.role_bn || item.role_en) : item.role_en
          const colorClass = `t${(i % 3) + 1}`
          const avatarColors = ["#F4C662", "#E9445E", "#5F7BE8"]
          const avatarColor = avatarColors[i % 3]

          return (
            <div key={i} className={`testi-card ${colorClass} reveal`}>
              <div className="testi-mark">"</div>
              <p>{quote}</p>
              <div className="testi-person">
                <svg className="testi-avatar" viewBox="0 0 42 42">
                  <rect width="42" height="42" rx="21" fill={avatarColor} />
                </svg>
                <div>
                  <b>{item.author}</b>
                  <span>{role}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
