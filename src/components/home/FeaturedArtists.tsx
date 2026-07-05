 
 
import { FeaturedArtistsContent } from "./FeaturedArtistsContent"

const fallbackArtists = [
  { id: '1', full_name_en: "Satyajit Ray", full_name_bn: "সত্যজিৎ রায়", role: "Featured Artist", bio_en: "A prominent figure in Indian cinema and art, known for his masterful storytelling and sketching.", avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200" },
  { id: '2', full_name_en: "Amrita Sher-Gil", full_name_bn: "অমৃতা শের-গিল", role: "Legacy Member", bio_en: "An eminent Indian painter, considered to be one of the greatest avant-garde women artists of the early 20th century.", avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" },
  { id: '3', full_name_en: "MF Husain", full_name_bn: "এম এফ হুসেন", role: "Guest Artist", bio_en: "A founding member of the Progressive Artists' Group of Bombay, known for executing bold, vibrantly coloured narrative paintings.", avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200" },
]

export async function HomeFeaturedArtists({ locale, artists }: { locale: string, artists?: any[] }) {
  const displayData = artists && artists.length > 0 ? artists : fallbackArtists

  return (
    <section className="py-32 bg-[#FDFBF7] relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-b from-[#E6E2D3]/30 to-transparent blur-3xl rounded-bl-full pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <FeaturedArtistsContent locale={locale} artists={displayData} />
      </div>
    </section>
  )
}
