'use client'

import { motion, Variants } from "framer-motion"
import { StatisticsCard } from "@/components/museum/statistics-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Palette, Users, Brush } from "lucide-react"

export function HomeStatisticsContent({ locale }: { locale: string }) {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const item: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto"
    >
      <motion.div variants={item}>
        <StatisticsCard title={locale === 'bn' ? "মোট শিল্পকর্ম" : "Curated Artworks"} value="1,248" icon={<Palette strokeWidth={1} size={32} />} />
      </motion.div>
      <motion.div variants={item}>
        <StatisticsCard title={locale === 'bn' ? "সক্রিয় শিল্পী" : "Global Artists"} value="342" icon={<Users strokeWidth={1} size={32} />} />
      </motion.div>
      <motion.div variants={item}>
        <StatisticsCard title={locale === 'bn' ? "প্রদর্শনীসমূহ" : "Major Exhibitions"} value="14" icon={<Brush strokeWidth={1} size={32} />} />
      </motion.div>
    </motion.div>
  )
}

export function HomeNewsletterContent({ locale, content }: { locale: string, content: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <h2 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-white">{content.title || "Join Our Artistic Journey"}</h2>
      <p className="text-white/80 text-xl font-light max-w-xl mx-auto leading-relaxed">
        {content.description || "Subscribe to our exclusive newsletter for early access to exhibitions, artist interviews, and curated collections."}
      </p>
      
      <form className="flex w-full max-w-lg mx-auto items-center mt-12 bg-white/10 backdrop-blur-sm p-1">
        <Input 
          type="email" 
          placeholder={locale === 'bn' ? "আপনার ইমেইল ঠিকানা" : "Your email address"} 
          className="bg-transparent text-white border-none rounded-none placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 text-lg px-6"
          required
        />
        <Button type="submit" variant="secondary" className="bg-white text-black hover:bg-gray-100 rounded-none h-14 px-8 text-sm uppercase tracking-widest font-semibold transition-colors">
          {locale === 'bn' ? "সাবস্ক্রাইব" : "Subscribe"}
        </Button>
      </form>
    </motion.div>
  )
}
