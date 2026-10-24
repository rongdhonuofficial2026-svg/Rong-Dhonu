import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { 
  Award, 
  Briefcase, 
  ExternalLink, 
  Mail, 
  Phone,
  User, 
  ArrowLeft, 
  Building2, 
  Calendar, 
  Palette,
  Sparkles,
  ChevronRight
} from "lucide-react"
import { Link } from "@/lib/i18n/routing"

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name_en, full_name_bn, bio_en, bio_bn, avatar_url')
    .eq('id', id)
    .maybeSingle()
  
  if (!profile) return {}

  const name = locale === 'bn' && profile.full_name_bn ? profile.full_name_bn : (profile.full_name_en || 'Artist')
  const bio = locale === 'bn' && profile.bio_bn ? profile.bio_bn : profile.bio_en

  return {
    title: `${name} — Artist Profile & Portfolio | Rongdhonu`,
    description: bio || `Explore the portfolio, artworks, and exhibition history of ${name} at Rongdhonu artists' collective.`,
    openGraph: {
      title: `${name} | Rongdhonu Artists`,
      description: bio || `Explore the portfolio of ${name}.`,
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
      id, full_name_en, full_name_bn, bio_en, bio_bn, phone, email,
      avatar_url, instagram_url, website_url, slug, role,
      artworks!artist_id(
        id, title_en, title_bn, main_image_url, category, medium_en, medium_bn, status, year, created_at, dimensions,
        exhibitions(id, year, theme_en, theme_bn, status, exhibition_end)
      ),
      exhibition_participants(status, exhibitions(id, year, theme_en, theme_bn, venue_en, venue_bn, status, exhibition_start, exhibition_end))
    `)
    .eq('id', id)
    .maybeSingle()

  if (error || !profile) return notFound()

  const name = locale === 'bn' && profile.full_name_bn ? profile.full_name_bn : (profile.full_name_en || (locale === 'bn' ? 'অজ্ঞাত শিল্পী' : 'Artist'))
  const bio = locale === 'bn' && profile.bio_bn ? profile.bio_bn : profile.bio_en

  // SEO JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.full_name_en || profile.full_name_bn || name,
    alternateName: profile.full_name_bn,
    image: profile.avatar_url,
    description: bio,
    jobTitle: 'Artist',
    url: `https://rongdhonu.org/${locale}/artists/${profile.id}`
  }

  // Filter approved artworks only — accessible if standalone, archived exhibition, or past end date
  const now = new Date()
  const approvedArtworks = (profile.artworks as any[])?.filter((art) => {
    if (art.status !== 'approved') return false
    const exh = Array.isArray(art.exhibitions) ? art.exhibitions[0] : art.exhibitions
    if (!exh) return true
    const exhEnd = exh.exhibition_end ? new Date(exh.exhibition_end) : null
    return exh.status === 'archived' || (exhEnd && now > exhEnd)
  }) || []

  // Gather unique exhibitions from participants table + approved artworks' exhibitions
  const directExhibitions = (profile.exhibition_participants as any[])
    ?.map((p) => (Array.isArray(p.exhibitions) ? p.exhibitions[0] : p.exhibitions))
    .filter(Boolean) || []

  const artworkExhibitions = approvedArtworks
    .map((art) => (Array.isArray(art.exhibitions) ? art.exhibitions[0] : art.exhibitions))
    .filter(Boolean)

  const combinedExhibitionsMap = new Map<string, any>()
  ;[...directExhibitions, ...artworkExhibitions].forEach((ex) => {
    if (ex?.id && !combinedExhibitionsMap.has(ex.id)) {
      combinedExhibitionsMap.set(ex.id, ex)
    }
  })

  const exhibitions = Array.from(combinedExhibitionsMap.values()).sort((a, b) => (b.year || 0) - (a.year || 0))

  return (
    <main className="min-h-screen py-10 md:py-16 px-4 sm:px-6 md:px-10 max-w-[1380px] mx-auto space-y-16 selection:bg-[#C8A96A] selection:text-[#0B0908]">
      {/* JSON-LD injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <Link 
          href="/artists" 
          className="inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-widest text-[#F4EEDF]/70 hover:text-[#C8A96A] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{locale === 'bn' ? 'সকল শিল্পীবৃন্দ' : 'All Artists'}</span>
        </Link>
        <span className="text-xs font-mono uppercase tracking-widest text-[#F4EEDF]/40">
          Rongdhonu Member Archive
        </span>
      </div>

      {/* ================================================================
          1. ARTIST PROFILE INTRODUCTION (Compact, Editorial, High Contrast)
          ================================================================ */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#14110F] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)]">
        {/* Subtle radial spotlight backdrop */}
        <div 
          className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 opacity-30 mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, rgba(200, 169, 106, 0.25) 0%, transparent 70%)'
          }}
        />

        <div className="relative p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Artist Portrait */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden shrink-0 border-2 border-white/15 bg-[#1B1714] shadow-2xl group">
            {profile.avatar_url ? (
              <Image 
                src={profile.avatar_url} 
                alt={name} 
                fill 
                sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 176px" 
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
                priority 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#F4EEDF]/40 bg-[#161210]">
                <User className="w-16 h-16 stroke-[1.2]" />
              </div>
            )}
          </div>

          {/* Artist Introduction & Details */}
          <div className="space-y-4 flex-1 min-w-0 w-full">
            {/* Role / Category Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[#C8A96A]/10 border border-[#C8A96A]/30 text-[#C8A96A] font-semibold">
                <Sparkles className="w-3 h-3" />
                {profile.role ? (locale === 'bn' && profile.role === 'member' ? 'সদস্য শিল্পী' : profile.role) : (locale === 'bn' ? 'শিল্পী' : 'Artist')}
              </span>

              {profile.slug && (
                <span className="text-xs font-mono text-[#F4EEDF]/40 hidden sm:inline">
                  @{profile.slug}
                </span>
              )}
            </div>

            {/* Full Name */}
            <h1 className="artist-page-hero-title text-3xl sm:text-4xl md:text-5xl font-serif text-[#F4EEDF] font-normal leading-tight tracking-tight">
              {name}
            </h1>

            {/* Verified Statistics & Metadata Pills */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-wider text-[#F4EEDF]/75 pt-1">
              <div className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/5">
                <Briefcase className="w-3.5 h-3.5 text-[#C8A96A]" />
                <span className="font-semibold text-[#F4EEDF]">{approvedArtworks.length}</span>
                <span className="text-[#F4EEDF]/60">{locale === 'bn' ? 'শিল্পকর্ম' : 'Artworks'}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/5">
                <Award className="w-3.5 h-3.5 text-[#C8A96A]" />
                <span className="font-semibold text-[#F4EEDF]">{exhibitions.length}</span>
                <span className="text-[#F4EEDF]/60">{locale === 'bn' ? 'প্রদর্শনী' : 'Exhibitions'}</span>
              </div>

              {profile.phone && (
                <div className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/5 truncate max-w-full">
                  <Phone className="w-3.5 h-3.5 text-[#C8A96A]" />
                  <span className="text-[#F4EEDF]/80 truncate">{profile.phone}</span>
                </div>
              )}
            </div>

            {/* Artist Biography */}
            {bio ? (
              <div className="pt-2 text-sm sm:text-base leading-relaxed text-[#F4EEDF]/85 font-serif max-w-3xl whitespace-pre-line">
                {bio}
              </div>
            ) : (
              <p className="pt-2 text-xs font-mono uppercase tracking-wider text-[#F4EEDF]/40 italic">
                {locale === 'bn' ? 'শিল্পী জীবনবৃত্তান্ত শীঘ্রই প্রকাশিত হবে।' : 'Artist statement and biography forthcoming.'}
              </p>
            )}

            {/* External Links / Portfolio Website */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/5">
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-semibold border border-white/15 bg-white/5 hover:bg-[#C8A96A] hover:text-[#0B0908] hover:border-[#C8A96A] text-[#F4EEDF] transition-all shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{locale === 'bn' ? 'ব্যক্তিগত পোর্টফোলিও' : 'Personal Website'}</span>
                </a>
              )}

              {profile.instagram_url && (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-semibold border border-white/10 bg-white/[0.02] hover:bg-white/10 text-[#F4EEDF]/80 hover:text-[#F4EEDF] transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C8A96A]" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          2. SELECTED WORKS / PORTFOLIO SECTION (Artwork-First Gallery)
          ================================================================ */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#C8A96A] font-semibold mb-1">
              {locale === 'bn' ? 'নির্বাচিত শিল্পকর্ম' : 'Curated Works'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#F4EEDF] font-normal">
              {locale === 'bn' ? 'শিল্পীর পোর্টফোলিও' : 'Artist Portfolio'}
            </h2>
          </div>

          <Link
            href={`/gallery?artist=${profile.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#C8A96A] hover:text-[#F4C662] transition-colors group"
          >
            <span>{locale === 'bn' ? 'গ্যালারিতে সমস্ত কাজ দেখুন' : 'Explore in Full Gallery'}</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {approvedArtworks.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-white/10 bg-white/[0.02] p-8 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mx-auto mb-3 text-[#C8A96A]">
              <Palette className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl text-[#F4EEDF] font-medium mb-1">
              {locale === 'bn' ? 'কোনো শিল্পকর্ম প্রকাশিত হয়নি' : 'No Artworks Published Yet'}
            </h3>
            <p className="text-xs text-[#F4EEDF]/60">
              {locale === 'bn' 
                ? 'এই শিল্পীর অনুমোদিত কাজগুলো বর্তমানে ডিজিটালাইজ করা হচ্ছে।' 
                : 'Approved artworks for this artist are being catalogued in the museum archives.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 items-start">
            {approvedArtworks.map((art: Record<string, any>, idx: number) => {
              const artTitle = locale === 'bn' && art.title_bn ? art.title_bn : art.title_en
              const medium = locale === 'bn' && art.medium_bn ? art.medium_bn : art.medium_en
              const year = art.year || (art.created_at ? new Date(art.created_at).getFullYear() : null)

              return (
                <div
                  key={art.id}
                  className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#14110F] hover:border-[#C8A96A]/50 transition-all duration-500 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_-15px_rgba(200,169,106,0.18)] hover:-translate-y-1.5"
                >
                  {/* Artwork Image Frame */}
                  <Link
                    href={`/gallery/artwork/${art.id}`}
                    className="relative w-full aspect-[4/5] bg-[#0E0C0A] flex items-center justify-center overflow-hidden p-4 group-hover:bg-[#181412] transition-colors"
                  >
                    {/* Subtle spotlight glow */}
                    <div 
                      className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen group-hover:opacity-40 transition-opacity"
                      style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(200, 169, 106, 0.25) 0%, transparent 75%)'
                      }}
                    />

                    {art.main_image_url ? (
                      <img
                        src={art.main_image_url}
                        alt={artTitle}
                        loading="lazy"
                        className="max-w-full max-h-full object-contain rounded-sm transition-transform duration-700 ease-out group-hover:scale-[1.03] shadow-md"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#F4EEDF]/30 p-4 text-center">
                        <Palette className="w-10 h-10 mb-2 opacity-40" />
                        <span className="text-xs uppercase tracking-wider font-mono">No Image</span>
                      </div>
                    )}

                    {/* Category badge */}
                    {art.category && (
                      <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/15 text-[#F4EEDF]/90">
                        {art.category}
                      </span>
                    )}

                    {/* Plate number */}
                    <span className="absolute top-3 right-3 z-10 text-[10px] font-mono text-[#F4EEDF]/40 tracking-wider">
                      No. {String(idx + 1).padStart(2, '0')}
                    </span>
                  </Link>

                  {/* Placard / Metadata Body */}
                  <div className="p-5 flex flex-col flex-1 justify-between space-y-3 bg-[#14110F]">
                    <div>
                      <h3 className="font-serif text-lg font-medium text-[#F4EEDF] group-hover:text-[#C8A96A] transition-colors line-clamp-1">
                        <Link href={`/gallery/artwork/${art.id}`} className="focus:outline-none focus:underline">
                          {artTitle}
                        </Link>
                      </h3>

                      {medium && (
                        <p className="text-xs font-serif text-[#F4EEDF]/65 mt-1 line-clamp-1">
                          {medium}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#F4EEDF]/50 font-mono">
                      <span>{art.dimensions || (locale === 'bn' ? 'আর্কাইভকৃত' : 'Archived')}</span>
                      {year && (
                        <span className="text-[#C8A96A] font-semibold">{year}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ================================================================
          3. EXHIBITION HISTORY (Curated Chronology Cards)
          ================================================================ */}
      <section className="space-y-6 pt-6 border-t border-white/10">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#C8A96A] font-semibold mb-1">
            {locale === 'bn' ? 'অংশগ্রহণের ইতিহাস' : 'Chronology'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#F4EEDF] font-normal">
            {locale === 'bn' ? 'প্রদর্শনী ইতিহাস' : 'Exhibition History'}
          </h2>
        </div>

        {exhibitions.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-white/10 bg-white/[0.02] p-6 max-w-md mx-auto">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-[#C8A96A]/60" />
            <p className="text-xs font-mono uppercase tracking-wider text-[#F4EEDF]/50">
              {locale === 'bn' ? 'প্রদর্শনী তালিকা শীঘ্রই যুক্ত হবে।' : 'No verified exhibitions on record.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exhibitions.map((ex: Record<string, any>) => {
              const exTitle = locale === 'bn' && ex.theme_bn ? ex.theme_bn : ex.theme_en
              const venue = locale === 'bn' && ex.venue_bn ? ex.venue_bn : ex.venue_en

              return (
                <Link
                  key={ex.id}
                  href={`/exhibitions/${ex.id}`}
                  className="group flex flex-col justify-between p-5 rounded-xl border border-white/10 bg-[#14110F] hover:bg-white/[0.04] hover:border-[#C8A96A]/40 transition-all duration-300 shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-[#C8A96A] font-semibold px-2 py-0.5 rounded bg-[#C8A96A]/10 border border-[#C8A96A]/20">
                        {ex.year || 'Annual'}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#F4EEDF]/40 group-hover:text-[#C8A96A] transition-colors flex items-center gap-1">
                        <span>View</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-medium text-[#F4EEDF] group-hover:text-[#C8A96A] transition-colors line-clamp-2">
                      {exTitle}
                    </h3>
                  </div>

                  {venue && (
                    <div className="pt-3 mt-3 border-t border-white/5 text-xs text-[#F4EEDF]/55 flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-[#C8A96A]/70" />
                      <span className="truncate">{venue}</span>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
