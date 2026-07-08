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
  if (!content || !content.items || content.items.length === 0) return null

  const title = content.title || (locale === 'bn' ? 'আমাদের সাথে তাদের অভিজ্ঞতা' : 'Voices from our community')

  return (
    <section className="testimonials" id="testimonials">
      <div className="testi-head reveal">
        <div className="eyebrow center">{locale === 'bn' ? 'তারা কী বলেন' : 'What They Say'}</div>
        <h2>{title}</h2>
      </div>

      <div className="testi-grid">
        {content.items.slice(0, 3).map((item: any, i: number) => {
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
