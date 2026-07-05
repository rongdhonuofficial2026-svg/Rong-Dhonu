'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/routing"
import Image from "next/image"

export function HomeAboutContent({ content }: { content: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 max-w-7xl mx-auto items-center">
      <motion.div 
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-12"
      >
        <div className="space-y-6">
          <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-semibold">The Mission</h3>
          <p className="font-serif text-3xl md:text-5xl leading-tight text-foreground">
            {content.mission || "Empowering artists and celebrating creativity across boundaries."}
          </p>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-semibold">The Vision</h3>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
            {content.vision || "To build the world's most immersive and inclusive digital art platform."}
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-none px-8 py-6 text-sm tracking-widest uppercase border-foreground/20 hover:bg-foreground hover:text-background transition-all">
          <Link href="/about">Discover Our Story</Link>
        </Button>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative h-[600px] w-full"
      >
        <Image 
          src="https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?auto=format&fit=crop&q=80&w=1000" 
          alt="Art Studio" 
          fill 
          className="object-cover shadow-2xl"
        />
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute -bottom-10 -left-10 bg-background p-10 shadow-xl max-w-sm border border-border/50 hidden md:block z-10"
        >
          <h4 className="font-serif text-2xl font-bold mb-4">A Brief History</h4>
          <p className="text-muted-foreground italic leading-relaxed">
            "{content.history || "Established in 2026 to redefine digital exhibitions."}"
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
