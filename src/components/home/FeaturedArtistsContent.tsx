'use client'

import { motion } from "framer-motion"
import { Link } from "@/lib/i18n/routing"
import Image from "next/image"
import { Globe, ArrowUpRight, ArrowRight } from "lucide-react"

export function FeaturedArtistsContent({ locale, artists }: { locale: string, artists: any[] }) {
  const title = locale === 'bn' ? "বিশিষ্ট শিল্পীবৃন্দ" : "Featured Artists"
  
  return (
    <div className="relative w-full bg-gradient-to-b from-[#1C1C1E] via-[#FDFBF7] to-[#1A1A1A] py-32 px-4 md:px-8">
      
      {/* Decorative paint strokes */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#7851A9]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#CC5500]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[90rem] mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24 space-y-6"
        >
          <h3 className="text-[10px] tracking-[0.5em] uppercase text-[#D4AF37] font-bold flex items-center justify-center gap-6">
            <span className="w-12 h-[2px] bg-[#D4AF37]"></span>
            The Creators
            <span className="w-12 h-[2px] bg-[#D4AF37]"></span>
          </h3>
          <h2 className="font-serif text-5xl md:text-7xl text-[#1C1C1E] font-bold">{title}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-20">
          {artists.map((artist, index) => {
            const name = locale === 'bn' ? (artist.full_name_bn || artist.full_name_en) : artist.full_name_en
            const role = artist.role === 'committee' ? (locale === 'bn' ? 'কমিটি সদস্য' : 'Committee Member') : (locale === 'bn' ? 'সদস্য' : 'Member')
            const delay = index * 0.1

            return (
              <motion.div 
                key={artist.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col items-center text-center relative"
              >
                {/* Collectible Card Style wrapper */}
                <div className="relative w-56 h-56 md:w-64 md:h-64 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37] to-[#FF7F50] rounded-full scale-[1.03] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-md" />
                  
                  <Link href={`/artists/${artist.id}`} className="block relative w-full h-full overflow-hidden rounded-full museum-shadow group-hover:shadow-[0_20px_40px_rgba(212,175,55,0.3)] transition-all duration-700 bg-white">
                    <Image 
                      src={artist.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600"} 
                      alt={name} 
                      fill 
                      className="object-cover transition-all duration-1000 ease-[0.25,1,0.5,1] transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 border-2 border-transparent rounded-full group-hover:border-white/50 transition-colors duration-500 z-10" />
                  </Link>
                  
                  {/* Floating Social Badge */}
                  <div className="absolute -bottom-4 right-4 flex gap-2 z-20 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    {artist.instagram_url && (
                      <a href={artist.instagram_url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white text-[#1C1C1E] flex items-center justify-center shadow-lg hover:bg-[#D4AF37] hover:text-white transition-colors">
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                    <Link href={`/artists/${artist.id}`} className="w-10 h-10 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center shadow-lg hover:bg-[#D4AF37] transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                
                <h4 className="font-serif text-3xl text-[#1C1C1E] mb-3 group-hover:text-[#D4AF37] transition-colors font-bold mt-4">
                  <Link href={`/artists/${artist.id}`}>{name}</Link>
                </h4>
                <p className="text-xs uppercase tracking-[0.2em] text-[#1C1C1E]/60 font-semibold">{role}</p>
              </motion.div>
            )
          })}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-32 text-center"
        >
          <Link 
            href="/artists" 
            className="inline-flex items-center gap-4 text-sm tracking-[0.3em] uppercase font-bold text-[#1C1C1E] hover:text-[#D4AF37] transition-colors group"
          >
            {locale === 'bn' ? "সম্পূর্ণ ডিরেক্টরি দেখুন" : "View Full Directory"}
            <span className="w-12 h-[2px] bg-[#1C1C1E] group-hover:bg-[#D4AF37] transition-all group-hover:w-16 duration-500 relative">
              <ArrowRight className="absolute -right-2 -top-2 w-4 h-4 text-[#1C1C1E] group-hover:text-[#D4AF37] transition-colors" />
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
