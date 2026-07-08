'use client'

import { motion } from "framer-motion"
import Image from "next/image"

export function HomeSponsorsContent({ locale, content }: { locale: string, content: any }) {
  if (!content || !content.logos || content.logos.length === 0) return null

  const title = content.title || (locale === 'bn' ? 'আমাদের সহযোগী প্রতিষ্ঠানসমূহ' : 'Supported By')

  return (
    <section className="supporters">
      <h3>{title}</h3>
      <div className="supporter-grid">
        {content.logos.map((logo: { name: string, url: string }, i: number) => (
          <div key={i} className="logo-box">
            <img src={logo.url} alt={logo.name} />
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomeTestimonialsContent({ locale, content }: { locale: string, content: any }) {
  if (!content || !content.items || content.items.length === 0) return null

  const title = content.title || (locale === 'bn' ? 'তারা কী বলেন' : 'Testimonials')
  const subtitle = locale === 'bn' 
    ? 'আমাদের শিল্পী, সমালোচক এবং পৃষ্ঠপোষকদের মতামত।' 
    : 'Voices from our network of artists, critics, and patrons.'

  return (
    <section className="testimonials" id="testimonials">
      <div className="section-head reveal">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <div className="testimonial-grid">
        {content.items.map((item: any, i: number) => {
          const quote = locale === 'bn' ? (item.quote_bn || item.quote_en) : item.quote_en
          const role = locale === 'bn' ? (item.role_bn || item.role_en) : item.role_en

          return (
            <div key={i} className="testimonial-card reveal">
              <p className="quote">"{quote}"</p>
              <div className="author">
                <b>{item.author}</b>
                <span>{role}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
