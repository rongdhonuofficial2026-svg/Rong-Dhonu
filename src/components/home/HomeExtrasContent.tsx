'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HomeNewsletterContent({ locale, content }: { locale: string, content: any }) {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A1B41 0%, #7851A9 50%, #1A1B41 100%)' }}>
      {/* Animated color orbs */}
      <motion.div
        className="blob absolute -top-32 -left-32 w-[600px] h-[600px] opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #D4AF37 0%, rgba(212,175,55,0) 70%)' }}
        animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob absolute -bottom-32 -right-32 w-[700px] h-[700px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #FF7F50 0%, rgba(255,127,80,0) 70%)' }}
        animate={{ scale: [1, 1.12, 1], rotate: [0, -8, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div
        className="blob absolute top-1/3 right-1/4 w-[400px] h-[400px] opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #50C878 0%, rgba(80,200,120,0) 70%)' }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />

      {/* Grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.6) 40%, rgba(212,175,55,0.6) 60%, transparent)' }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-28 md:py-40 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow */}
          <p className="text-[10px] tracking-[0.6em] uppercase text-[#D4AF37] font-bold flex items-center justify-center gap-5 mb-8">
            <span className="w-14 h-[1px] bg-[#D4AF37]/60" />
            {locale === 'bn' ? 'নিউজলেটার' : 'Newsletter'}
            <span className="w-14 h-[1px] bg-[#D4AF37]/60" />
          </p>

          {/* Headline */}
          <h2 className="font-serif text-[3rem] md:text-[5rem] lg:text-[5.5rem] text-white font-bold leading-[1.04] mb-6"
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}>
            {content?.title || (locale === 'bn' ? 'আমাদের যাত্রায় যোগ দিন' : 'Join Our Journey')}
          </h2>

          {/* Subtext */}
          <p className="text-white/65 text-base md:text-xl font-serif italic leading-relaxed max-w-lg mx-auto mb-14">
            {content?.description || (locale === 'bn'
              ? 'প্রদর্শনী, শিল্পী সাক্ষাৎকার এবং বিশেষ সংগ্রহে আর্লি অ্যাক্সেস পেতে সাবস্ক্রাইব করুন।'
              : 'Subscribe for early access to exhibitions, artist interviews, and curated collections.')}
          </p>

          {/* Email form */}
          <form className="flex flex-col sm:flex-row items-center w-full max-w-xl mx-auto gap-0"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          >
            <Input
              type="email"
              placeholder={locale === 'bn' ? 'আপনার ইমেইল ঠিকানা' : 'Your email address'}
              required
              className="flex-1 h-16 rounded-none border-0 bg-white/10 backdrop-blur-md text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 text-base px-7 font-light border-r border-white/10"
            />
            <Button
              type="submit"
              className="h-16 px-10 bg-[#D4AF37] text-black hover:bg-white rounded-none text-xs uppercase tracking-[0.35em] font-bold transition-all duration-400 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] whitespace-nowrap"
            >
              {locale === 'bn' ? 'যুক্ত হোন' : 'Subscribe'}
            </Button>
          </form>

          {/* Fine print */}
          <p className="mt-6 text-white/30 text-[11px] tracking-wide">
            {locale === 'bn' ? 'আমরা কখনো স্প্যাম পাঠাই না।' : 'No spam, ever. Unsubscribe anytime.'}
          </p>
        </motion.div>
      </div>

      {/* Bottom: blend to charcoal footer */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #1C1C1E)' }}
      />
    </section>
  )
}
