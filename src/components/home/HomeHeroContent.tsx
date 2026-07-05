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
  { x: '10%', y: '20%', size: 4, delay: 0, color: '#D4AF37' },
  { x: '85%', y: '15%', size: 3, delay: 1.2, color: '#FF7F50' },
  { x: '70%', y: '70%', size: 5, delay: 0.6, color: '#D4AF37' },
  { x: '25%', y: '75%', size: 3, delay: 2, color: '#7851A9' },
  { x: '92%', y: '55%', size: 4, delay: 1.8, color: '#50C878' },
  { x: '5%', y: '50%', size: 3, delay: 0.9, color: '#FF7F50' },
  { x: '50%', y: '10%', size: 4, delay: 1.5, color: '#D4AF37' },
  { x: '60%', y: '88%', size: 3, delay: 2.5, color: '#7851A9' },
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
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <div ref={ref} className="relative w-full h-[100vh] min-h-[680px] overflow-hidden bg-[#0A0A0A]">

      {/* === Background Image with Parallax + Zoom === */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 z-0 w-full h-[110%]"
      >
        <PremiumImage
          src={heroImage}
          fallbackSrc="/images/placeholders/hero.png"
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
            radial-gradient(ellipse at center, transparent 20%, rgba(10,10,10,0.4) 100%),
            linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, transparent 40%, transparent 55%, rgba(10,10,10,0.95) 100%)
          `
        }}
      />

      {/* Warm artistic color wash — cobalt blue + gold glow */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 15% 50%, rgba(0,71,171,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 30%, rgba(212,175,55,0.20) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(120,81,169,0.12) 0%, transparent 60%)
          `
        }}
      />

      {/* Subtle canvas grain */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* === Floating Paint Blobs === */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {/* Large gold blob top-right */}
        <motion.div
          className="blob absolute -top-32 -right-32 w-[700px] h-[700px] opacity-25 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, #D4AF37 0%, #CC5500 50%, transparent 70%)' }}
          animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Cobalt blob bottom-left */}
        <motion.div
          className="blob absolute -bottom-40 -left-20 w-[500px] h-[500px] opacity-20 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, #0047AB 0%, #7851A9 60%, transparent 80%)' }}
          animate={{ scale: [1, 1.12, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* Small emerald blob center-left */}
        <motion.div
          className="blob absolute top-1/3 -left-16 w-[300px] h-[300px] opacity-15 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, #50C878 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      {/* === Floating Particles === */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {particles.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      {/* === Decorative gold line accent === */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-20 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, #D4AF37 40%, #D4AF37 60%, transparent)' }}
      />

      {/* === HERO CONTENT === */}
      <motion.div
        style={{ opacity }}
        className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center"
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="max-w-6xl mx-auto flex flex-col items-center"
        >
          {/* Eyebrow label */}
          <motion.div variants={itemVariants} className="mb-8 flex items-center gap-5">
            <span className="w-14 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className="text-[10px] tracking-[0.6em] uppercase font-bold text-[#D4AF37]">
              {locale === 'bn' ? 'রংধনু শিল্পী সংঘ' : 'Rongdhono Artists\' Collective'}
            </span>
            <span className="w-14 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </motion.div>

          {/* Main headline — editorial split lines */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-[3.2rem] md:text-[5.5rem] lg:text-[7.5rem] font-bold text-white leading-[1.02] tracking-tight"
            style={{ textShadow: '0 4px 40px rgba(0,0,0,0.5)' }}
          >
            {titleLines.map((line: string, i: number) => (
              <span key={i} className={`block ${i === 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5D76E] to-[#D4AF37]' : ''}`}>
                {line}
              </span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-8 text-base md:text-xl lg:text-2xl text-white/75 max-w-2xl font-light tracking-wide leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-14 flex flex-col sm:flex-row items-center gap-5"
          >
            {/* Primary — solid gold */}
            <Link
              href={exhibition ? `/exhibitions/${exhibition.id}` : "/exhibitions"}
              className="group relative inline-flex items-center gap-3 bg-[#D4AF37] text-black px-10 py-5 text-sm uppercase tracking-[0.25em] font-bold overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]"
            >
              <span className="relative z-10">{ctaPrimary}</span>
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
              <span className="absolute inset-0 bg-white translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
              <span className="absolute inset-0 bg-white translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:text-black" />
            </Link>

            {/* Secondary — ghost glass */}
            <Link
              href="/about"
              className="group inline-flex items-center gap-3 border border-white/40 text-white px-10 py-5 text-sm uppercase tracking-[0.25em] font-medium backdrop-blur-sm bg-white/5 hover:bg-white/15 hover:border-white/70 transition-all duration-400"
            >
              {ctaSecondary}
              <span className="transition-transform duration-300 group-hover:translate-x-1 opacity-70">→</span>
            </Link>
          </motion.div>

          {/* Exhibition badge — only if active exhibition */}
          {exhibition && (
            <motion.div
              variants={itemVariants}
              className="mt-12 inline-flex items-center gap-3 border border-white/20 bg-white/10 backdrop-blur-md px-6 py-3 text-xs uppercase tracking-[0.3em] text-white/80 font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#50C878] animate-pulse" />
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
        <span className="text-[9px] tracking-[0.5em] uppercase font-bold text-white/50">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-7 h-11 border border-white/25 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2.5 bg-[#D4AF37] rounded-full" />
        </motion.div>
      </motion.div>

      {/* === Bottom cream bleed — seamless into About section === */}
      <div className="absolute bottom-0 left-0 right-0 h-40 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #FDFBF7)' }}
      />
    </div>
  )
}
