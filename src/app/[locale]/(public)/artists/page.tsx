import { createClient } from "@/lib/supabase/server"
import { SectionHeading } from "@/components/museum/section-heading"
import { ArtistCard } from "@/components/museum/artist-card"
import { generateDynamicMetadata } from "@/lib/seo"
import { Link } from "@/lib/i18n/routing"
import { EmptyState } from "@/components/museum/states"

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return generateDynamicMetadata({
    title: locale === 'bn' ? "শিল্পীবৃন্দ" : "Artists",
    description: locale === 'bn' ? "রংধনু শিল্পী সংঘের মেধাবী সদস্যদের আবিষ্কার করুন।" : "Discover the talented members of the Rongdhono artists' collective.",
    url: '/artists',
    locale
  })
}

const fallbackArtists = [
  { id: '1', full_name_en: "Satyajit Ray", full_name_bn: "সত্যজিৎ রায়", role: "Featured Artist", bio_en: "A prominent figure in Indian cinema and art.", avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200" },
  { id: '2', full_name_en: "Amrita Sher-Gil", full_name_bn: "অমৃতা শের-গিল", role: "Legacy Member", bio_en: "An eminent Indian painter.", avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" },
  { id: '3', full_name_en: "MF Husain", full_name_bn: "এম এফ হুসেন", role: "Guest Artist", bio_en: "Known for executing bold, vibrantly coloured narrative paintings.", avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200" },
]

export default async function ArtistsDirectoryPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = await createClient()
  
  const { data: artists } = await supabase
    .from('profiles')
    .select('id, full_name_en, full_name_bn, bio_en, bio_bn, avatar_url, role')
    .eq('role', 'member')
    .order('full_name_en', { ascending: true })

  const hasData = artists && artists.length > 0
  const displayData = hasData ? artists : fallbackArtists

  return (
    <main className="flex flex-col w-full min-h-screen pt-32 pb-24 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeading 
          title={locale === 'bn' ? "আমাদের শিল্পীবৃন্দ" : "Our Artists"} 
          subtitle={locale === 'bn' ? "রংধনু পরিবারের সৃজনশীল মন" : "The creative minds of the Rongdhono family"}
        />
        
        {displayData.length === 0 ? (
          <EmptyState title="No artists found" className="mt-16" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            {displayData.map((artist: any) => {
              const name = locale === 'bn' ? (artist.full_name_bn || artist.full_name_en) : artist.full_name_en
              const bio = locale === 'bn' ? (artist.bio_bn || artist.bio_en) : artist.bio_en
              
              return (
                <Link key={artist.id} href={`/artists/${artist.id}`}>
                  <ArtistCard
                    name={name || "Unknown Artist"}
                    role={artist.role === 'member' ? (locale === 'bn' ? 'সদস্য' : 'Member') : artist.role}
                    bioSnippet={bio}
                    avatarUrl={artist.avatar_url}
                  />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
