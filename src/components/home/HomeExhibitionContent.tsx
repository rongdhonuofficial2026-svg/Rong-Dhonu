'use client'

import { motion } from "framer-motion"
import { ExhibitionCard } from "@/components/museum/exhibition-card"
import { Timeline } from "@/components/museum/timeline"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

interface HomeExhibitionContentProps {
  locale: string
  currentExhibition: any
  timelineItems: any[]
}

export function HomeExhibitionContent({ locale, currentExhibition, timelineItems }: HomeExhibitionContentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mt-16 max-w-7xl mx-auto items-center">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="lg:col-span-7"
      >
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl" />
          <ExhibitionCard
            id={currentExhibition.id}
            title={locale === 'bn' ? (currentExhibition.title_bn || currentExhibition.title_en) : currentExhibition.title_en}
            status={currentExhibition.status as any}
            venue={locale === 'bn' ? (currentExhibition.venue_bn || currentExhibition.venue_en) : currentExhibition.venue_en}
            startDate={new Date(currentExhibition.start_date)}
            endDate={new Date(currentExhibition.end_date)}
            coverImageUrl={currentExhibition.hero_image_url}
            className="w-full shadow-2xl border-none ring-1 ring-border/50"
          />
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="lg:col-span-5 space-y-12 pl-0 lg:pl-10 border-l border-border/40"
      >
        <div className="space-y-4">
          <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-semibold">
            {locale === 'bn' ? "সময়রেখা" : "The Timeline"}
          </h3>
          <h4 className="font-serif text-3xl md:text-4xl font-bold leading-tight">
            {locale === 'bn' ? "প্রদর্শনীর সময়রেখা" : "Exhibition Journey"}
          </h4>
        </div>
        
        <Timeline items={timelineItems} />
        
        <div className="pt-4">
          <Button asChild variant="outline" className="rounded-none px-8 py-6 text-sm tracking-widest uppercase border-foreground/20 hover:bg-foreground hover:text-background transition-all w-full sm:w-auto">
            <Link href="/exhibitions">
              {locale === 'bn' ? "সকল প্রদর্শনী দেখুন" : "View All Exhibitions"}
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
