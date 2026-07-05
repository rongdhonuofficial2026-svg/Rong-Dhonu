'use client'

import { motion, useScroll, useTransform } from "framer-motion"
import { Link } from "@/lib/i18n/routing"
import { PremiumImage } from "@/components/ui/PremiumImage"
import { useRef } from "react"

export function HomeAboutContent({ content, locale }: { content: any, locale?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"])
  const textX = useTransform(scrollYProgress, [0, 1], ["30px", "0px"])
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1])

  const mission = content?.mission || (locale === 'bn' 
    ? "শিল্পীদের ক্ষমতায়ন করা এবং সীমানা পেরিয়ে সৃজনশীলতা উদযাপন করা।" 
    : "Empowering artists and celebrating creativity across every boundary.")
  const vision = content?.vision || (locale === 'bn' 
    ? "বিশ্বের সবচেয়ে নিমজ্জিত এবং অন্তর্ভুক্তিমূলক আর্ট প্ল্যাটফর্ম।" 
    : "To become the world's most immersive and inclusive art platform.")
  const history = content?.history || (locale === 'bn' 
    ? "ডিজিটাল প্রদর্শনী পুনরায় সংজ্ঞায়িত করতে ২০২৬ সালে প্রতিষ্ঠিত।" 
    : "Founded in 2026 to redefine what a digital exhibition can be.")

  return (
    <section className="relative bg-[#FDFBF7] canvas-texture overflow-hidden">
      {/* Seamless top blend from hero */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#FDFBF7] to-transparent z-10 pointer-events-none" />

      {/* Ambient color glows */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)' }}
      />
      <div className="absolute bottom-0 -right-32 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(204,85,0,0.06) 0%, transparent 70%)' }}
      />

      {/* Decorative floating circles */}
      <motion.div
        className="absolute top-20 right-24 w-80 h-80 rounded-full border border-[#D4AF37]/15 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-32 right-32 w-56 h-56 rounded-full border border-[#D4AF37]/10 pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div ref={containerRef} className="relative z-10 max-w-[90rem] mx-auto px-4 md:px-8 py-24 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* === Left: Large Artistic Photo === */}
          <div className="lg:col-span-7 relative">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-[520px] lg:h-[820px] overflow-hidden group"
            >
              {/* Gold frame accent */}
              <div className="absolute -top-3 -left-3 w-24 h-24 border-t-2 border-l-2 border-[#D4AF37]/60 z-10 pointer-events-none" />
              <div className="absolute -bottom-3 -right-3 w-24 h-24 border-b-2 border-r-2 border-[#D4AF37]/60 z-10 pointer-events-none" />

              <motion.div style={{ y: imgY }} className="absolute inset-0 h-[115%] -top-[7.5%]">
                <PremiumImage
                  src="/images/placeholders/hero.webp"
                  fallbackSrc="/images/placeholders/hero.webp"
                  alt="Artist at work"
                  fill
                  priority
                  className="object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                />
                {/* Warm overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1C1C1E]/30 via-transparent to-[#D4AF37]/10 mix-blend-multiply" />
              </motion.div>

              {/* Floating quote card */}
              <motion.div
                initial={{ opacity: 0, y: 40, x: 20 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-8 -right-4 md:-right-12 max-w-xs z-20 bg-[#FDFBF7] border-l-4 border-[#D4AF37] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
              >
                <p className="text-5xl text-[#D4AF37] font-serif leading-none mb-3 opacity-60">&ldquo;</p>
                <p className="text-[#1C1C1E]/80 italic leading-relaxed font-serif text-base">
                  {history}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-[#D4AF37]" />
                  <span className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37] font-bold">Est. 2026</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* === Right: Editorial Text === */}
          <motion.div
            style={{ x: textX, opacity: textOpacity }}
            className="lg:col-span-5 space-y-14 lg:pl-8 mt-12 lg:mt-0"
          >
            {/* Eyebrow */}
            <div>
              <p className="text-[10px] tracking-[0.6em] uppercase text-[#D4AF37] font-bold flex items-center gap-4 mb-8">
                <span className="w-10 h-[1px] bg-[#D4AF37]" />
                {locale === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
              </p>
              <h2 className="font-serif text-[2.8rem] md:text-[3.8rem] leading-[1.08] text-[#1C1C1E] font-bold">
                {mission}
              </h2>
            </div>

            {/* Vision */}
            <div className="space-y-4 border-l-2 border-[#D4AF37]/30 pl-8">
              <p className="text-[9px] tracking-[0.5em] uppercase text-[#1C1C1E]/40 font-bold">
                {locale === 'bn' ? 'আমাদের দৃষ্টিভঙ্গি' : 'Our Vision'}
              </p>
              <p className="text-[#1C1C1E]/65 text-lg md:text-xl leading-relaxed font-light font-serif italic">
                {vision}
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6 pt-4">
              {[
                { num: '14+', label: locale === 'bn' ? 'প্রদর্শনী' : 'Exhibitions' },
                { num: '340+', label: locale === 'bn' ? 'শিল্পী' : 'Artists' },
                { num: '1.2K+', label: locale === 'bn' ? 'শিল্পকর্ম' : 'Artworks' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                  className="text-center py-6 border-t border-[#1C1C1E]/10 group"
                >
                  <p className="font-serif text-4xl md:text-5xl font-bold text-[#1C1C1E] group-hover:text-[#D4AF37] transition-colors duration-500">{s.num}</p>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-[#1C1C1E]/40 font-bold mt-2">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/about"
              className="group inline-flex items-center gap-4 text-sm tracking-[0.3em] uppercase font-bold text-[#1C1C1E] hover:text-[#D4AF37] transition-colors duration-400"
            >
              {locale === 'bn' ? 'আমাদের গল্প জানুন' : 'Discover Our Story'}
              <span className="relative flex items-center">
                <span className="w-10 h-[1px] bg-current transition-all duration-400 group-hover:w-16" />
                <span className="absolute right-0 text-base">→</span>
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom: seamless transition into dark exhibition section */}
      <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #1C1C1E)' }}
      />
    </section>
  )
}
