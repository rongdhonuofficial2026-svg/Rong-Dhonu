'use client'

import { motion } from "framer-motion"
import Image from "next/image"

export function HomeSponsorsContent({ locale, content }: { locale: string, content: any }) {
  if (!content.logos || content.logos.length === 0) return null

  return (
    <section className="relative bg-[#EFE6D2] py-16 overflow-hidden border-t border-[#DCCFAE]/40">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <p className="text-[9px] tracking-[0.5em] uppercase text-[#5C5347] font-bold text-center mb-12">
            {content.title || (locale === 'bn' ? 'सहयोगিতায়' : 'Supported By')}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-14 md:gap-24 opacity-40 hover:opacity-75 transition-opacity duration-700">
            {content.logos.map((logo: { name: string, url: string }, i: number) => (
              <div key={i} className="relative w-28 h-12 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <Image src={logo.url} alt={logo.name} fill className="object-contain" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export function HomeTestimonialsContent({ locale, content }: { locale: string, content: any }) {
  if (!content.items || content.items.length === 0) return null

  return (
    <section className="relative bg-[#EFE6D2] overflow-hidden text-[#1E1A16]">
      {/* Ambient color pools */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[700px] rounded-full pointer-events-none -translate-y-1/3"
        style={{ background: 'radial-gradient(circle, rgba(217,162,51,0.04) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none translate-y-1/3"
        style={{ background: 'radial-gradient(circle, rgba(180,35,58,0.03) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-[1320px] mx-auto px-6 md:px-12 py-28 md:py-40">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="text-center mb-20 md:mb-28"
        >
          <p className="eyebrow on-paper mb-6">
            {locale === 'bn' ? 'কণ্ঠস্বর' : 'Voices'}
          </p>
          <h2 className="font-serif text-[3rem] md:text-[5rem] lg:text-[5.5rem] text-[#1E1A16] font-bold leading-[1.04]">
            {content.title || (locale === 'bn' ? 'তারা কী বলেন' : 'What They Say')}
          </h2>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {content.items.map((item: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: [0.19, 1, 0.22, 1] }}
              className="group relative bg-[#F4EEDF] border border-[#DCCFAE] p-10 md:p-12 hover:-translate-y-3 transition-all duration-700 ease-[0.19,1,0.22,1] overflow-hidden"
              style={{ boxShadow: '0 10px 40px -10px rgba(30,26,22,0.08)' }}
            >
              {/* Crimson top edge on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#B4233A] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              {/* Ambient color wash on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at top left, rgba(180,35,58,0.04) 0%, transparent 60%)' }}
              />

              {/* Large quotation mark */}
              <div className="font-serif text-[6rem] md:text-[7rem] leading-none text-[#B4233A]/10 group-hover:text-[#B4233A]/25 transition-colors duration-700 absolute -top-2 left-6 pointer-events-none select-none">
                &ldquo;
              </div>

              {/* Quote text */}
              <p className="relative z-10 text-[#1E1A16]/80 text-base md:text-lg italic leading-relaxed font-serif mt-8 mb-10 min-h-[120px]">
                {locale === 'bn' ? (item.quote_bn || item.quote_en) : item.quote_en}
              </p>

              {/* Author row */}
              <div className="flex items-center gap-4 border-t border-[#DCCFAE] pt-7">
                {/* Avatar initial circle */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B4233A] to-[#D9A233] flex items-center justify-center text-white font-serif text-xl font-bold flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                  {item.author?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-bold text-[#1E1A16] text-base tracking-wide">{item.author}</p>
                  <p className="text-[9px] tracking-[0.35em] uppercase text-[#B4233A] font-bold mt-0.5">
                    {locale === 'bn' ? (item.role_bn || item.role_en) : item.role_en}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom: blend to dark newsletter */}
      <div className="h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #EFE6D2, #0B0908)' }}
      />
    </section>
  )
}
