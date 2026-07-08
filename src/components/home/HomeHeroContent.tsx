'use client'

import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import { PremiumImage } from '@/components/ui/PremiumImage'
import { Link } from '@/lib/i18n/routing'
import { useRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface HomeHeroContentProps {
  locale: string
  content: any
  exhibition?: any
}

// Floating particle component
function Particle({ x, y, size, delay, color }: { x: string; y: string; size: number; delay: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, backgroundColor: color }}
      animate={{
        y: [0, -40, 0],
        opacity: [0.3, 0.8, 0.3],
        scale: [1, 1.4, 1],
      }}
      transition={{
        duration: 5 + delay,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  )
}

const particles = [
  { x: '10%', y: '20%', size: 4, delay: 0, color: '#F4C662' },
  { x: '85%', y: '15%', size: 3, delay: 1.2, color: 'rgba(244, 238, 223, 0.3)' },
  { x: '70%', y: '70%', size: 5, delay: 0.6, color: '#F4C662' },
  { x: '25%', y: '75%', size: 3, delay: 2, color: 'rgba(244, 238, 223, 0.2)' },
  { x: '92%', y: '55%', size: 4, delay: 1.8, color: '#F4C662' },
  { x: '5%', y: '50%', size: 3, delay: 0.9, color: 'rgba(244, 238, 223, 0.3)' },
  { x: '50%', y: '10%', size: 4, delay: 1.5, color: '#F4C662' },
  { x: '60%', y: '88%', size: 3, delay: 2.5, color: 'rgba(244, 238, 223, 0.2)' },
]

export function HomeHeroContent({ locale, content, exhibition }: HomeHeroContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  const heroImage = content?.imageUrl || exhibition?.hero_image_url

  const title = content?.title || (locale === 'bn' ? "যেখানে সৃজনশীলতা ঐতিহ্যকে স্পর্শ করে" : "Where Creativity\nMeets Legacy")
  const subtitle = content?.subtitle || (locale === 'bn' ? "রংধনু শিল্পী সংঘের বার্ষিক আন্তর্জাতিক প্রদর্শনী" : "The Annual International Exhibition of Rongdhono Artists' Collective")
  const ctaPrimary = content?.ctaPrimary || (locale === 'bn' ? "প্রদর্শনী দেখুন" : "Explore Exhibition")
  const ctaSecondary = content?.ctaSecondary || (locale === 'bn' ? "আমাদের সম্পর্কে" : "Our Story")

  const titleLines = title.split('\n')

  const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.18, delayChildren: 0.4 } }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 60, filter: 'blur(8px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.2, ease: [0.19, 1, 0.22, 1] } }
  }

  return (
    <div ref={ref} className="relative w-full h-[100vh] min-h-[680px] overflow-hidden bg-[#0B0908]">

      {/* === Background Image with Parallax + Zoom === */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 z-0 w-full h-[110%]"
      >
        <PremiumImage
          src={heroImage}
          fallbackSrc="/images/placeholders/hero.webp"
          alt="Rongdhono Art Exhibition"
          fill
          priority
          className="object-cover object-center"
        />
      </motion.div>

      {/* === Multi-Layer Cinematic Color Grading === */}
      {/* Deep vignette from all edges */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 20%, rgba(11,9,8,0.5) 100%),
            linear-gradient(to bottom, rgba(11,9,8,0.45) 0%, transparent 40%, transparent 55%, rgba(11,9,8,0.95) 100%)
          `
        }}
      />

      {/* Warm artistic color wash — subtle gold glow */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 15% 50%, rgba(244,198,98,0.06) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 30%, rgba(244,198,98,0.08) 0%, transparent 50%)
          `
        }}
      />

      {/* === Floating Paint Blobs === */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {/* Large gold blob top-right */}
        <motion.div
          className="blob absolute -top-32 -right-32 w-[700px] h-[700px] opacity-15 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(244,198,98,0.2) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Soft gold blob bottom-left */}
        <motion.div
          className="blob absolute -bottom-40 -left-20 w-[500px] h-[500px] opacity-10 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(244,198,98,0.15) 0%, transparent 80%)' }}
          animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* === Floating Particles === */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {particles.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      {/* === Decorative gold line accent === */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] z-20 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(244,198,98,0.2) 40%, rgba(244,198,98,0.2) 60%, transparent)' }}
      />

      {/* === HERO CONTENT === */}
      <motion.div
        style={{ opacity }}
        className="relative z-20 flex flex-col items-center justify-center h-full px-6 text-center"
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="max-w-6xl mx-auto flex flex-col items-center"
        >
          {/* Eyebrow label */}
          <motion.div variants={itemVariants} className="mb-8 flex items-center gap-5">
            <span className="w-14 h-[1px] bg-gradient-to-r from-transparent to-[#F4C662]" />
            <span className="text-[10px] tracking-[0.6em] uppercase font-bold text-[#F4C662]">
              {locale === 'bn' ? 'রংধনু শিল্পী সংঘ' : 'Rongdhono Artists\' Collective'}
            </span>
            <span className="w-14 h-[1px] bg-gradient-to-l from-transparent to-[#F4C662]" />
          </motion.div>

          {/* Main headline — editorial split lines */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-[3rem] md:text-[5.5rem] lg:text-[7.5rem] font-bold text-[#F4EEDF] leading-[1.02] tracking-tight"
            style={{ textShadow: '0 4px 40px rgba(0,0,0,0.6)' }}
          >
            {titleLines.map((line: string, i: number) => (
              <span key={i} className={`block ${i === 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#F4C662] via-[#F4EEDF] to-[#F4C662]' : ''}`}>
                {line}
              </span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-8 text-sm md:text-lg lg:text-xl text-[#F4EEDF]/75 max-w-2xl font-light tracking-wide leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-col sm:flex-row items-center gap-5"
          >
            {/* Primary — solid gold */}
            <Link
              href={exhibition ? `/exhibitions/${exhibition.id}` : "/exhibitions"}
              className="btn btn-gold uppercase tracking-widest font-bold text-[13px] rounded-full active:scale-[0.97]"
            >
              {ctaPrimary}
            </Link>

            {/* Secondary — ghost line */}
            <Link
              href="/about"
              className="btn btn-line uppercase tracking-widest font-medium text-[13px] rounded-full active:scale-[0.97]"
            >
              {ctaSecondary}
            </Link>
          </motion.div>

          {/* Exhibition badge — only if active exhibition */}
          {exhibition && (
            <motion.div
              variants={itemVariants}
              className="mt-12 inline-flex items-center gap-3 border border-white/[0.08] bg-white/[0.03] backdrop-blur-md px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.25em] text-[#F4EEDF]/80 font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#33CB9C] animate-pulse" />
              {locale === 'bn' ? 'বর্তমানে প্রদর্শনী চলছে' : 'Exhibition Now Open'}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* === Scroll indicator === */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 pointer-events-none"
      >
        <span className="text-[9px] tracking-[0.5em] uppercase font-bold text-[#F4EEDF]/40">Scroll</span>
        <div className="w-[1px] h-12 bg-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-[#F4C662] animate-scroll-cue origin-top" />
        </div>
      </motion.div>

      {/* === Bottom bleed — seamless transition to paper about === */}
      <div className="absolute bottom-0 left-0 right-0 h-40 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #EFE6D2)' }}
      />
    </div>
  )
}
