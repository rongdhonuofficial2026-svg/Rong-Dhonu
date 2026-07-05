import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Award, Briefcase, ExternalLink, Mail, User } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name_en, last_name_en, full_name_bn, bio_en, bio_bn, avatar_url')
    .eq('id', id)
    .single()
  
  if (!profile) return {}

  const name = locale === 'bn' && profile.full_name_bn ? profile.full_name_bn : `${profile.first_name_en} ${profile.last_name_en}`
  const bio = locale === 'bn' && profile.bio_bn ? profile.bio_bn : profile.bio_en

  return {
    title: `${name} | Rongdhono Artists`,
    description: bio,
    openGraph: {
      title: `${name} | Rongdhono Artists`,
      description: bio,
      images: profile.avatar_url ? [profile.avatar_url] : []
    }
  }
}

export default async function ArtistProfilePage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      *,
      artworks!artist_id(id, title_en, title_bn, main_image_url, category, status),
      exhibition_participants(role, exhibitions(id, year, title_en, title_bn))
    `)
    .eq('id', id)
    .single()

  if (error || !profile) return notFound()

  // SEO JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${profile.first_name_en} ${profile.last_name_en}`,
    alternateName: profile.full_name_bn,
    image: profile.avatar_url,
    description: profile.bio_en,
    jobTitle: 'Artist',
    url: `https://rongdhono.org/${locale}/artists/${profile.id}`
  }

  const name = locale === 'bn' && profile.full_name_bn ? profile.full_name_bn : `${profile.first_name_en} ${profile.last_name_en}`
  const bio = locale === 'bn' && profile.bio_bn ? profile.bio_bn : profile.bio_en
  const approvedArtworks = profile.artworks?.filter((art: Record<string, any>) => art.status === 'approved') || []
  const exhibitions = profile.exhibition_participants?.map((p: Record<string, any>) => p.exhibitions) || []

  return (
    <main className="min-h-screen py-16 px-4 md:px-8 max-w-7xl mx-auto space-y-16">
      {/* JSON-LD injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header Profile Section */}
      <section className="flex flex-col md:flex-row gap-8 items-start bg-muted/30 p-8 rounded-3xl border border-border">
        <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shrink-0 border-4 border-background shadow-lg bg-muted">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={name} fill className="object-cover" priority />
          ) : (
            <User className="w-16 h-16 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
        </div>
        
        <div className="space-y-4 flex-1">
          <div>
            <Badge variant="outline" className="mb-2 capitalize">{profile.role}</Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold">{name}</h1>
          </div>
          
          <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
            {profile.phone && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> <span>{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> <span>{approvedArtworks.length} Artworks</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" /> <span>{exhibitions.length} Exhibitions</span>
            </div>
          </div>
          
          {bio && (
            <p className="text-lg leading-relaxed text-muted-foreground mt-4 max-w-3xl">
              {bio}
            </p>
          )}

          {profile.portfolio_url && (
            <Button variant="outline" className="mt-4" asChild>
              <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                {locale === 'bn' ? 'পোর্টফোলিও দেখুন' : 'View External Portfolio'}
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Exhibitions History */}
      {exhibitions.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-serif text-3xl font-bold border-b border-border pb-2">
            {locale === 'bn' ? 'প্রদর্শনী ইতিহাস' : 'Exhibition History'}
          </h2>
          <div className="flex flex-wrap gap-4">
            {exhibitions.map((ex: Record<string, any>) => (
              <Button key={ex.id} variant="secondary" asChild className="rounded-full shadow-sm">
                <Link href={`/exhibitions/${ex.id}`}>
                  {ex.year} - {locale === 'bn' && ex.title_bn ? ex.title_bn : ex.title_en}
                </Link>
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* Portfolio / Approved Artworks */}
      {approvedArtworks.length > 0 && (
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-border pb-2">
            <h2 className="font-serif text-3xl font-bold">
              {locale === 'bn' ? 'শিল্পকর্ম' : 'Portfolio'}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/gallery?artist=${profile.id}`}>
                {locale === 'bn' ? 'সব দেখুন' : 'View All'}
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {approvedArtworks.map((art: Record<string, any>) => (
              <Link key={art.id} href={`/gallery/artwork/${art.id}`} className="group space-y-3">
                <div className="relative aspect-square bg-muted rounded-xl overflow-hidden border border-border">
                  {art.main_image_url && (
                    <Image src={art.main_image_url} alt={art.title_en} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="shadow-md bg-white/80 backdrop-blur-sm border-0">{art.category}</Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold line-clamp-1 group-hover:text-accent transition-colors">
                    {locale === 'bn' && art.title_bn ? art.title_bn : art.title_en}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </main>
  )
}
