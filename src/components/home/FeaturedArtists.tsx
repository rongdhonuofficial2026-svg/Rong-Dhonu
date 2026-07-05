 
 
import { createClient } from "@/lib/supabase/server"
import { SectionHeading } from "@/components/museum/section-heading"
import { ArtistCard } from "@/components/museum/artist-card"
import { Link } from "@/lib/i18n/routing"
import { EmptyState } from "@/components/museum/states"

const fallbackArtists = [
  { id: '1', full_name_en: "Satyajit Ray", full_name_bn: "সত্যজিৎ রায়", role: "Featured Artist", bio_en: "A prominent figure in Indian cinema and art, known for his masterful storytelling and sketching.", avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200" },
  { id: '2', full_name_en: "Amrita Sher-Gil", full_name_bn: "অমৃতা শের-গিল", role: "Legacy Member", bio_en: "An eminent Indian painter, considered to be one of the greatest avant-garde women artists of the early 20th century.", avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" },
  { id: '3', full_name_en: "MF Husain", full_name_bn: "এম এফ হুসেন", role: "Guest Artist", bio_en: "A founding member of the Progressive Artists' Group of Bombay, known for executing bold, vibrantly coloured narrative paintings.", avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200" },
]

export async function HomeFeaturedArtists({ locale }: { locale: string }) {
  const supabase = await createClient()
  
  const { data: artists, error } = await supabase
    .from('profiles')
    .select('id, full_name_en, full_name_bn, bio_en, bio_bn, avatar_url')
    .eq('role', 'member')
    .limit(3)

  const hasData = artists && artists.length > 0
  const displayData = hasData ? artists : fallbackArtists

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeading 
          title={locale === 'bn' ? "বিশিষ্ট শিল্পীবৃন্দ" : "Featured Artists"} 
          subtitle={locale === 'bn' ? "রংধনু পরিবারের সৃজনশীল মন" : "The creative minds behind the Rongdhono collective."}
        />
        
        {displayData.length === 0 ? (
          <EmptyState title="No artists found" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {displayData.map((artist: any) => {
              const name = locale === 'bn' ? (artist.full_name_bn || artist.full_name_en) : artist.full_name_en
              const bio = locale === 'bn' ? (artist.bio_bn || artist.bio_en) : artist.bio_en
              
              return (
                <Link key={artist.id} href={`/artists/${artist.id}`}>
                  <ArtistCard
                    name={name || "Unknown Artist"}
                    role={artist.role || "Member"}
                    bioSnippet={bio}
                    avatarUrl={artist.avatar_url}
                  />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
