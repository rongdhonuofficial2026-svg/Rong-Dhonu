'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HomeNewsletterContent({ locale, content }: { locale: string, content: any }) {
  return (
    <section className="relative overflow-hidden bg-[#0B0908] border-t border-white/[0.08]">
      {/* Animated color orbs */}
      <motion.div
        className="blob absolute -top-32 -left-32 w-[600px] h-[600px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(244,198,98,0.15) 0%, rgba(244,198,98,0) 70%)' }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob absolute -bottom-32 -right-32 w-[700px] h-[700px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(244,198,98,0.1) 0%, rgba(244,198,98,0) 70%)' }}
        animate={{ scale: [1, 1.08, 1], rotate: [0, -5, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(244,198,98,0.15) 40%, rgba(244,198,98,0.15) 60%, transparent)' }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-28 md:py-40 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        >
          {/* Eyebrow */}
          <p className="eyebrow mb-8 flex justify-center">
            {locale === 'bn' ? 'নিউজলেটার' : 'Newsletter'}
          </p>

          {/* Headline */}
          <h2 className="font-serif text-[3rem] md:text-[5rem] lg:text-[5.5rem] text-white font-bold leading-[1.04] mb-6"
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
            {content?.title || (locale === 'bn' ? 'আমাদের যাত্রায় যোগ দিন' : 'Join Our Journey')}
          </h2>

          {/* Subtext */}
          <p className="text-[#F4EEDF]/65 text-base md:text-xl font-serif italic leading-relaxed max-w-lg mx-auto mb-14">
            {content?.description || (locale === 'bn'
              ? 'প্রদর্শনী, শিল্পী সাক্ষাৎকার এবং বিশেষ সংগ্রহে আর্লি অ্যাক্সেস পেতে সাবস্ক্রাইব করুন।'
              : 'Subscribe for early access to exhibitions, artist interviews, and curated collections.')}
          </p>

          {/* Email form */}
          <form className="flex flex-col sm:flex-row items-center w-full max-w-xl mx-auto gap-4 sm:gap-6 bg-transparent"
          >
            <Input
              type="email"
              placeholder={locale === 'bn' ? 'আপনার ইমেইল ঠিকানা' : 'Your email address'}
              required
              className="bg-transparent border-t-0 border-x-0 border-b border-white/20 text-white placeholder:text-white/25 focus-visible:ring-0 focus-visible:border-[#F4C662] rounded-none h-14 px-0 text-base flex-1 w-full"
            />
            <Button
              type="submit"
              className="btn btn-gold font-bold text-[13px] uppercase tracking-widest rounded-full w-full sm:w-auto shrink-0 active:scale-[0.97]"
            >
              {locale === 'bn' ? 'যুক্ত হোন' : 'Subscribe'}
            </Button>
          </form>

          {/* Fine print */}
          <p className="mt-6 text-[#F4EEDF]/30 text-[11px] tracking-wide">
            {locale === 'bn' ? 'আমরা কখনো স্প্যাম পাঠাই না।' : 'No spam, ever. Unsubscribe anytime.'}
          </p>
        </motion.div>
      </div>

      {/* Bottom: blend to charcoal footer */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0B0908)' }}
      />
    </section>
  )
}
