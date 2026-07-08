'use client'

import { motion, useScroll, useTransform } from "framer-motion"
import { Link } from "@/lib/i18n/routing"
import { PremiumImage } from "@/components/ui/PremiumImage"
import { useRef } from "react"

export function HomeAboutContent({ content, locale, stats }: { content: any, locale?: string, stats?: any }) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const mission = content?.mission || (locale === 'bn' 
    ? <>শিল্পীদের একটি সমৃদ্ধ সম্প্রদায় গড়ে তোলা এবং সৃজনশীল অভিব্যক্তির জন্য এমন একটি প্ল্যাটফর্ম প্রদান করা যা <b>সীমানা অতিক্রম করে।</b></>
    : <>To foster a thriving community of artists and provide a platform for creative expression that <b>transcends boundaries.</b></>)
  
  const vision = content?.vision || (locale === 'bn' 
    ? "আমাদের দৃষ্টিভঙ্গি: সমসাময়িক সমাদৃত শিল্পের চূড়ান্ত গন্তব্য হয়ে ওঠা, সাংস্কৃতিক ঐতিহ্য সংরক্ষণ করা এবং সাহসী, আপসহীন নতুন শৈল্পিক কণ্ঠস্বরকে চ্যাম্পিয়ন করা।" 
    : "Our vision: to become the definitive destination for contemporary Bengal art, preserving cultural heritage while championing bold, uncompromising new artistic voices.")
  
  const history = content?.history || (locale === 'bn' 
    ? "২০১২ সালে শিল্পকলার প্রতি গভীর অনুরাগের মধ্য দিয়ে প্রতিষ্ঠিত রংধনু স্থানীয় চিত্রশিল্পীদের একটি ক্ষুদ্র বৃত্ত থেকে বাংলার অন্যতম সেরা প্রদর্শনী সংস্থায় পরিণত হয়েছে।" 
    : "Founded in 2012 with a passion for the arts, Rongdhono has grown from a small circle of local painters into Bengal's premier exhibition collective.")

  const totalExhibitions = stats?.totalExhibitions || 14
  const totalArtists = stats?.totalArtists || 340
  const totalArtworks = stats?.totalArtworks || 1200

  const aboutImage = content?.imageUrl || "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?q=80&w=1400&auto=format&fit=crop"

  return (
    <section className="about" id="about" ref={containerRef}>
      <div className="about-grid">
        {/* Left Visual Panel */}
        <div className="about-visual reveal">
          <div className="about-img-main artwork">
            <img 
              src={aboutImage} 
              alt="Blue and red abstract studio painting" 
              loading="lazy" 
            />
            <div className="scrim soft"></div>
            <div className="frame-edge"></div>
          </div>
          <div className="about-note">
            <p>"{history}"</p>
            <div className="sig">
              {locale === 'bn' ? '— প্রতিষ্ঠিত ২০১২, বর্ধমান' : '— Est. 2012, Bardhaman'}
            </div>
          </div>
        </div>

        {/* Right Copy Panel */}
        <div className="about-copy reveal">
          <div className="eyebrow on-paper">
            {locale === 'bn' ? 'রংধনু সম্পর্কে' : 'About Rongdhono'}
          </div>
          <h2>
            {typeof mission === 'string' ? (
              <span dangerouslySetInnerHTML={{ __html: mission }} />
            ) : (
              mission
            )}
          </h2>
          <p className="about-vision">{vision}</p>
          
          <div className="about-stats">
            <div>
              <b>{totalExhibitions}+</b>
              <span>{locale === 'bn' ? 'প্রদর্শনী কিউরেট করা হয়েছে' : 'Exhibitions Curated'}</span>
            </div>
            <div>
              <b>{totalArtists}+</b>
              <span>{locale === 'bn' ? 'সদস্য শিল্পী' : 'Member Artists'}</span>
            </div>
            <div>
              <b>{totalArtworks >= 1000 ? `${(totalArtworks / 1000).toFixed(1)}K` : totalArtworks}+</b>
              <span>{locale === 'bn' ? 'সংগ্রাহক ও পৃষ্ঠপোষক' : 'Collectors & Patrons'}</span>
            </div>
          </div>

          <Link href="/about" className="about-link font-bold text-sm">
            {locale === 'bn' ? 'আমাদের গল্প জানুন' : 'Discover Our Story'}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block ml-1">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
