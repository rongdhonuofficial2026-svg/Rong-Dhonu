'use client'

import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/routing"
import Image from "next/image"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"

export function HomeAboutContent({ content, locale }: { content: any, locale?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])

  const mission = content?.mission || (locale === 'bn' ? "শিল্পীদের ক্ষমতায়ন এবং সীমানা পেরিয়ে সৃজনশীলতা উদযাপন।" : "Empowering artists and celebrating creativity across boundaries.")
  const vision = content?.vision || (locale === 'bn' ? "বিশ্বের সবচেয়ে নিমজ্জিত এবং অন্তর্ভুক্তিমূলক ডিজিটাল আর্ট প্ল্যাটফর্ম তৈরি করা।" : "To build the world's most immersive and inclusive digital art platform.")
  const history = content?.history || (locale === 'bn' ? "ডিজিটাল প্রদর্শনী পুনরায় সংজ্ঞায়িত করতে ২০২৬ সালে প্রতিষ্ঠিত।" : "Established in 2026 to redefine digital exhibitions.")

  return (
    <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 max-w-7xl mx-auto items-center">
      
      {/* Text Section */}
      <motion.div 
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="lg:col-span-5 space-y-16 lg:pr-8"
      >
        <div className="space-y-6">
          <h3 className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-semibold flex items-center gap-4">
            <span className="w-8 h-[1px] bg-[#D4AF37]"></span>
            The Mission
          </h3>
          <p className="font-serif text-3xl md:text-5xl leading-[1.2] text-[#1C1C1E]">
            {mission}
          </p>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-semibold flex items-center gap-4">
            <span className="w-8 h-[1px] bg-muted-foreground/30"></span>
            The Vision
          </h3>
          <p className="text-muted-foreground text-lg leading-relaxed font-light">
            {vision}
          </p>
        </div>

        <Button 
          asChild 
          variant="ghost" 
          className="group px-0 hover:bg-transparent text-[#1C1C1E] hover:text-[#D4AF37] transition-colors rounded-none text-xs tracking-widest uppercase font-semibold flex items-center gap-4"
        >
          <Link href="/about">
            Discover Our Story
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
          </Link>
        </Button>
      </motion.div>
      
      {/* Image Section */}
      <div className="lg:col-span-7 relative w-full h-[600px] lg:h-[800px] overflow-hidden">
        <motion.div 
          style={{ y }}
          className="absolute inset-0 w-full h-[120%]"
        >
          <Image 
            src="https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?auto=format&fit=crop&q=80&w=1000" 
            alt="Art Studio" 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
        </motion.div>
        
        {/* Floating Glass Box */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-0 left-0 bg-[#FDFBF7]/90 backdrop-blur-md p-10 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] max-w-sm border-l-4 border-[#D4AF37] hidden md:block z-10"
        >
          <h4 className="font-serif text-2xl font-bold mb-4 text-[#1C1C1E]">A Brief History</h4>
          <p className="text-[#1C1C1E]/70 italic leading-relaxed font-serif text-lg">
            "{history}"
          </p>
        </motion.div>
      </div>
    </div>
  )
}
