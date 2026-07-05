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
    <div ref={containerRef} className="relative z-30 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 max-w-[90rem] mx-auto items-center -mt-24 md:-mt-40 px-4 md:px-8">
      
      {/* Decorative watercolor blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#FF7F50]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Image Section - Moved to Left for asymmetrical overlap */}
      <div className="lg:col-span-7 relative w-full h-[500px] lg:h-[900px] overflow-hidden museum-shadow group">
        <motion.div 
          style={{ y }}
          className="absolute inset-0 w-full h-[120%]"
        >
          <Image 
            src="https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&q=100&w=1200" 
            alt="Artist creating masterpiece" 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E]/40 to-transparent mix-blend-overlay" />
        </motion.div>
        
        {/* Floating Glass Quote Box overlapping the image */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -bottom-10 -right-10 lg:bottom-16 lg:-right-24 glass bg-[#FDFBF7]/80 p-10 md:p-14 max-w-[400px] hidden md:block z-40 border-t-[6px] border-[#D4AF37]"
        >
          <h4 className="font-serif text-3xl font-bold mb-4 text-[#1C1C1E]">The Legacy</h4>
          <p className="text-[#1C1C1E]/80 italic leading-relaxed font-serif text-xl">
            "{history}"
          </p>
        </motion.div>
      </div>

      {/* Text Section */}
      <motion.div 
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="lg:col-span-5 space-y-16 lg:pl-16 relative z-20 mt-10 lg:mt-32"
      >
        <div className="space-y-8">
          <h3 className="text-xs tracking-[0.4em] uppercase text-[#D4AF37] font-bold flex items-center gap-6">
            <span className="w-12 h-[2px] bg-[#D4AF37]"></span>
            Our Mission
          </h3>
          <p className="font-serif text-4xl md:text-6xl leading-[1.1] text-[#1C1C1E] font-bold">
            {mission}
          </p>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-xs tracking-[0.4em] uppercase text-[#1C1C1E]/40 font-bold flex items-center gap-6">
            <span className="w-12 h-[1px] bg-[#1C1C1E]/20"></span>
            Our Vision
          </h3>
          <p className="text-[#1C1C1E]/70 text-xl md:text-2xl leading-relaxed font-light font-serif italic">
            {vision}
          </p>
        </div>

        <Button 
          asChild 
          variant="ghost" 
          className="group px-0 hover:bg-transparent text-[#1C1C1E] hover:text-[#D4AF37] transition-colors duration-300 rounded-none text-sm tracking-widest uppercase font-bold flex items-center gap-4 mt-8"
        >
          <Link href="/about">
            Discover Our Story
            <span className="w-8 h-[1px] bg-[#1C1C1E] group-hover:bg-[#D4AF37] group-hover:w-12 transition-all duration-300 ml-2 relative">
               <ArrowRight className="absolute -right-1 -top-2 w-4 h-4 text-[#1C1C1E] group-hover:text-[#D4AF37] transition-colors" />
            </span>
          </Link>
        </Button>
      </motion.div>
      
    </div>
  )
}
