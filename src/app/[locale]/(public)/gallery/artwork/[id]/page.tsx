import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { 
  ArrowLeft, 
  Palette, 
  Ruler, 
  Calendar, 
  Sparkles, 
  Layers, 
  Eye, 
  ShieldCheck, 
  CheckCircle2, 
  User, 
  ExternalLink,
  Tag,
  Building2
} from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"
import { ArtworkImageViewer } from "@/components/public/artwork/ArtworkImageViewer"

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: artwork } = await supabase
    .from('artworks')
    .select('title_en, title_bn, description_en, description_bn, main_image_url, profiles!artist_id(full_name_en, full_name_bn), exhibitions!exhibition_id(id, status, exhibition_end)')
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle()

  if (!artwork) return {}

  // Lazy-sync the exhibition lifecycle so a physically-ended exhibition
  // gets its status updated before we check visibility
  const rawExh = Array.isArray(artwork.exhibitions) ? artwork.exhibitions[0] : (artwork.exhibitions as any)
  let exhibitionStatus = rawExh?.status
  if (rawExh && exhibitionStatus && exhibitionStatus !== 'archived' && exhibitionStatus !== 'draft') {
    const { syncExhibitionLifecycle } = await import('@/lib/exhibition-lifecycle')
    const synced = await syncExhibitionLifecycle(rawExh, supabase)
    if (synced) exhibitionStatus = synced.status
  }
  // Belt-and-suspenders: also allow access if exhibition_end date has passed
  const exhibitionEnd = rawExh?.exhibition_end ? new Date(rawExh.exhibition_end) : null
  const physicallyEnded = exhibitionEnd ? new Date() > exhibitionEnd : false
  if (exhibitionStatus && exhibitionStatus !== 'archived' && !physicallyEnded) return {}

  const title = locale === 'bn' && artwork.title_bn ? artwork.title_bn : artwork.title_en
  const desc = locale === 'bn' && artwork.description_bn ? artwork.description_bn : artwork.description_en
  const p = Array.isArray(artwork.profiles) ? artwork.profiles[0] : (artwork.profiles as any)
  const artist = (locale === 'bn' && p?.full_name_bn) ? p.full_name_bn : (p?.full_name_en ?? 'Unknown Artist')

  return {
    title: `${title} — ${artist} | Rongdhonu Digital Museum`,
    description: desc || `Exhibited fine artwork "${title}" by ${artist} in Rongdhonu's official annual art exhibition.`,
    openGraph: {
      title: `${title} — ${artist} | Rongdhonu`,
      description: desc || `Exhibited fine artwork "${title}" by ${artist}.`,
      images: artwork.main_image_url ? [artwork.main_image_url] : [],
    },
  }
}

export default async function ArtworkDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()

  const { data: artwork, error } = await supabase
    .from('artworks')
    .select(`
      id, title_en, title_bn, description_en, description_bn,
      medium_en, medium_bn, materials_en, materials_bn,
      dimensions, category, theme, price, availability, availability_status_col,
      framed, orientation, weight, creation_date, year, display_location, notes,
      main_image_url,
      exhibition_id, artist_id, created_at,
      profiles!artist_id(id, full_name_en, full_name_bn, avatar_url, bio_en, bio_bn, slug, role),
      exhibitions!exhibition_id(id, year, theme_en, theme_bn, status, exhibition_start, exhibition_end, venue_en, venue_bn)
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle()

  if (error || !artwork) return notFound()

  // Lazy-sync the exhibition lifecycle so that a physically-ended exhibition
  // has its status updated before we gate artwork visibility.
  const rawExhibition = Array.isArray(artwork.exhibitions) ? artwork.exhibitions[0] : (artwork.exhibitions as any)
  let liveExhibition = rawExhibition
  if (rawExhibition && rawExhibition.status && rawExhibition.status !== 'archived' && rawExhibition.status !== 'draft') {
    const { syncExhibitionLifecycle } = await import('@/lib/exhibition-lifecycle')
    const synced = await syncExhibitionLifecycle(rawExhibition, supabase)
    if (synced) liveExhibition = synced
  }

  // Gating rule: standalone, archived exhibition, or past physical end date
  const exhibitionEnd = liveExhibition?.exhibition_end ? new Date(liveExhibition.exhibition_end) : null
  const physicallyEnded = exhibitionEnd ? new Date() > exhibitionEnd : false
  const exhibitionEnded = !liveExhibition || liveExhibition.status === 'archived' || physicallyEnded
  if (!exhibitionEnded) return notFound()

  const profile = Array.isArray(artwork.profiles) ? artwork.profiles[0] : (artwork.profiles as any)
  const exhibition = liveExhibition
  const artistName = (locale === 'bn' && profile?.full_name_bn) ? profile.full_name_bn : (profile?.full_name_en ?? (locale === 'bn' ? 'অজ্ঞাত শিল্পী' : 'Unknown Artist'))
  const artistId = profile?.id ?? artwork.artist_id
  const artistBio = locale === 'bn' ? (profile?.bio_bn || profile?.bio_en) : (profile?.bio_en || profile?.bio_bn)

  const title = locale === 'bn' && artwork.title_bn ? artwork.title_bn : artwork.title_en
  const desc = locale === 'bn' && artwork.description_bn ? artwork.description_bn : artwork.description_en
  const medium = locale === 'bn' && artwork.medium_bn ? artwork.medium_bn : (artwork.medium_en || artwork.materials_en)
  const materials = locale === 'bn' && artwork.materials_bn ? artwork.materials_bn : artwork.materials_en
  const theme = artwork.theme
  const yearCreated = artwork.year || (artwork.creation_date ? new Date(artwork.creation_date).getFullYear() : (artwork.created_at ? new Date(artwork.created_at).getFullYear() : null))

  // Determine availability status
  const rawAvailability = artwork.availability || artwork.availability_status_col || 'not_for_sale'
  const isAvailable = rawAvailability === 'available' || rawAvailability === 'for_sale'
  const isSold = rawAvailability === 'sold'
  const isNotForSale = rawAvailability === 'not_for_sale' || (!isAvailable && !isSold)

  const availabilityLabel = (() => {
    if (isAvailable) return locale === 'bn' ? 'সংগ্রহের জন্য উপলব্ধ' : 'Available for Acquisition'
    if (isSold) return locale === 'bn' ? 'বিক্রিত (ব্যক্তিগত সংগ্রহ)' : 'Sold · Private Collection'
    return locale === 'bn' ? 'বিক্রয়ের জন্য নয়' : 'Not for Sale · Museum Archive'
  })()

  // SEO JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artwork.title_en,
    alternateName: artwork.title_bn,
    image: artwork.main_image_url,
    description: artwork.description_en || desc,
    creator: {
      '@type': 'Person',
      name: profile?.full_name_en || artistName,
      url: `https://rongdhonu.org/${locale}/artists/${artistId}`,
    },
    artMedium: artwork.medium_en || medium,
    artform: artwork.category || 'Painting',
    dateCreated: yearCreated ? String(yearCreated) : undefined,
    offers: artwork.price ? {
      '@type': 'Offer',
      price: artwork.price,
      priceCurrency: 'BDT',
      availability: isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    } : undefined,
  }

  return (
    <main className="min-h-screen py-8 md:py-14 px-4 sm:px-6 md:px-10 max-w-[1440px] mx-auto space-y-10 selection:bg-[#C8A96A] selection:text-[#0B0908]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <Link 
          href="/gallery" 
          className="inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-widest text-[#F4EEDF]/70 hover:text-[#C8A96A] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{locale === 'bn' ? 'গ্যালারিতে ফিরে যান' : 'Back to Gallery'}</span>
        </Link>

        {exhibition && (
          <Link
            href={`/exhibitions/${exhibition.id}`}
            className="inline-flex items-center gap-2 text-xs md:text-sm text-[#F4EEDF]/60 hover:text-[#F4EEDF] transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-[#C8A96A]" />
            <span className="truncate max-w-[240px] sm:max-w-md">
              {exhibition.year} · {locale === 'bn' && exhibition.theme_bn ? exhibition.theme_bn : exhibition.theme_en}
            </span>
          </Link>
        )}
      </div>

      {/* Main Exhibition Layout: Artwork Canvas (Left/Top) + Curatorial Placard (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
        
        {/* Visual Artwork Showcase Area (7 Cols on Desktop) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          <ArtworkImageViewer 
            src={artwork.main_image_url} 
            alt={title}
          />
        </div>

        {/* Curatorial Wall Placard / Details Panel (5 Cols on Desktop) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-8">
          
          {/* Header Block: Category, Title, Artist, Status */}
          <div className="space-y-4 pb-6 border-b border-white/10">
            {/* Category badge & Acquisition Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              {artwork.category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans tracking-widest uppercase bg-white/5 border border-white/15 text-[#F4EEDF]/90 font-medium">
                  <Tag className="w-3 h-3 text-[#C8A96A]" />
                  {artwork.category}
                </span>
              )}

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans tracking-wide uppercase font-semibold ${
                isAvailable 
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                  : isSold 
                  ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
                  : 'bg-white/5 text-[#F4EEDF]/70 border border-white/10'
              }`}>
                {isAvailable && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                {availabilityLabel}
              </span>
            </div>

            {/* Artwork Title */}
            <h1 className="artwork-detail-title text-3xl sm:text-4xl md:text-5xl font-serif text-[#F4EEDF] leading-[1.08] tracking-tight">
              {title}
            </h1>

            {/* Artist Attributive Link */}
            <div className="flex items-center gap-2 pt-1 text-lg sm:text-xl text-[#F4EEDF]/75 font-serif">
              <span className="italic text-[#F4EEDF]/50">{locale === 'bn' ? 'শিল্পী' : 'by'}</span>
              <Link 
                href={`/artists/${artistId}`}
                className="text-[#C8A96A] hover:text-[#F4C662] underline-offset-4 hover:underline transition-colors font-medium"
              >
                {artistName}
              </Link>
            </div>

            {/* Price Tag (if listed for acquisition) */}
            {artwork.price && isAvailable && (
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-mono font-bold text-[#F4EEDF]">৳{artwork.price}</span>
                <span className="text-xs text-[#F4EEDF]/50 uppercase tracking-wider font-mono">BDT (Price upon inquiry)</span>
              </div>
            )}
          </div>

          {/* Curatorial Metadata Matrix (Structured Placard Specifications) */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#C8A96A] font-semibold">
              {locale === 'bn' ? 'শিল্পকর্মের বিবরণ ও পরিমাপ' : 'Artwork Specifications'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Medium */}
              {medium && (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F4EEDF]/55 mb-1">
                    <Palette className="w-3.5 h-3.5 text-[#C8A96A]" />
                    <span>{locale === 'bn' ? 'মাধ্যম' : 'Medium'}</span>
                  </div>
                  <p className="text-sm font-medium text-[#F4EEDF] leading-snug">{medium}</p>
                </div>
              )}

              {/* Dimensions */}
              {artwork.dimensions && (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F4EEDF]/55 mb-1">
                    <Ruler className="w-3.5 h-3.5 text-[#C8A96A]" />
                    <span>{locale === 'bn' ? 'পরিমাপ' : 'Dimensions'}</span>
                  </div>
                  <p className="text-sm font-medium text-[#F4EEDF] leading-snug">{artwork.dimensions}</p>
                </div>
              )}

              {/* Creation Year */}
              {yearCreated && (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F4EEDF]/55 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C8A96A]" />
                    <span>{locale === 'bn' ? 'সৃষ্টির বছর' : 'Year Created'}</span>
                  </div>
                  <p className="text-sm font-medium text-[#F4EEDF] leading-snug">{yearCreated}</p>
                </div>
              )}

              {/* Materials / Composition */}
              {materials && materials !== medium && (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F4EEDF]/55 mb-1">
                    <Layers className="w-3.5 h-3.5 text-[#C8A96A]" />
                    <span>{locale === 'bn' ? 'উপকরণ' : 'Materials'}</span>
                  </div>
                  <p className="text-sm font-medium text-[#F4EEDF] leading-snug">{materials}</p>
                </div>
              )}

              {/* Framing Status */}
              {typeof artwork.framed === 'boolean' && (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F4EEDF]/55 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C8A96A]" />
                    <span>{locale === 'bn' ? 'ফ্রেম অবস্থা' : 'Framing'}</span>
                  </div>
                  <p className="text-sm font-medium text-[#F4EEDF] leading-snug">
                    {artwork.framed ? (locale === 'bn' ? 'ফ্রেমযুক্ত' : 'Framed') : (locale === 'bn' ? 'ফ্রেমবিহীন' : 'Unframed')}
                  </p>
                </div>
              )}

              {/* Orientation */}
              {artwork.orientation && (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F4EEDF]/55 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#C8A96A]" />
                    <span>{locale === 'bn' ? 'দিকবিন্যাস' : 'Orientation'}</span>
                  </div>
                  <p className="text-sm font-medium text-[#F4EEDF] capitalize leading-snug">{artwork.orientation}</p>
                </div>
              )}

              {/* Theme / Series */}
              {theme && (
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors sm:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#F4EEDF]/55 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#C8A96A]" />
                    <span>{locale === 'bn' ? 'মূলভাব / থিম' : 'Exhibition Theme'}</span>
                  </div>
                  <p className="text-sm font-medium text-[#F4EEDF] leading-snug">{theme}</p>
                </div>
              )}
            </div>
          </div>

          {/* Curatorial Statement / Description */}
          {desc && (
            <div className="space-y-3 pt-6 border-t border-white/10">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#C8A96A] font-semibold">
                {locale === 'bn' ? 'কিউরেটোরিয়াল বিবরণ ও মন্তব্য' : 'Curatorial Statement & Notes'}
              </h3>
              <div className="text-sm md:text-base leading-relaxed text-[#F4EEDF]/85 font-serif space-y-2 whitespace-pre-line bg-white/[0.02] p-4 rounded-xl border border-white/5">
                {desc}
              </div>
            </div>
          )}

          {/* Exhibition Attribution Card */}
          {exhibition && (
            <div className="pt-6 border-t border-white/10 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#C8A96A] font-semibold">
                {locale === 'bn' ? 'প্রদর্শনী তথ্য' : 'Exhibited In'}
              </h3>
              <Link 
                href={`/exhibitions/${exhibition.id}`}
                className="group flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#C8A96A]/40 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-[#C8A96A]/10 border border-[#C8A96A]/30 flex items-center justify-center shrink-0 text-[#C8A96A] group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#C8A96A] font-semibold">{exhibition.year}</span>
                    <span className="text-xs text-[#F4EEDF]/40">•</span>
                    <span className="text-xs uppercase tracking-wider text-[#F4EEDF]/60">Annual Exhibition</span>
                  </div>
                  <h4 className="text-sm md:text-base font-serif font-medium text-[#F4EEDF] group-hover:text-[#C8A96A] transition-colors truncate">
                    {locale === 'bn' && exhibition.theme_bn ? exhibition.theme_bn : exhibition.theme_en}
                  </h4>
                  {(exhibition.venue_en || exhibition.venue_bn) && (
                    <p className="text-xs text-[#F4EEDF]/50 truncate">
                      {locale === 'bn' && exhibition.venue_bn ? exhibition.venue_bn : exhibition.venue_en}
                    </p>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-[#F4EEDF]/40 group-hover:text-[#C8A96A] transition-colors shrink-0 mt-1" />
              </Link>
            </div>
          )}

          {/* Participating Artist Spotlight Card */}
          {profile && (
            <div className="pt-6 border-t border-white/10 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#C8A96A] font-semibold">
                {locale === 'bn' ? 'শিল্পী পরিচিতি' : 'About the Artist'}
              </h3>
              <Link 
                href={`/artists/${artistId}`}
                className="group flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#C8A96A]/40 transition-all duration-300"
              >
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-black/40 border border-white/15 shrink-0 group-hover:border-[#C8A96A]/60 transition-colors">
                  {profile.avatar_url ? (
                    <Image 
                      src={profile.avatar_url} 
                      alt={artistName} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#F4EEDF]/40">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#C8A96A] font-medium">
                      {profile.role || 'Exhibiting Artist'}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#F4EEDF]/40 group-hover:text-[#C8A96A] transition-colors shrink-0" />
                  </div>
                  <h4 className="text-base font-serif font-semibold text-[#F4EEDF] group-hover:text-[#C8A96A] transition-colors truncate">
                    {artistName}
                  </h4>
                  {artistBio && (
                    <p className="text-xs text-[#F4EEDF]/70 line-clamp-2 leading-relaxed">
                      {artistBio}
                    </p>
                  )}
                  <span className="inline-block text-xs text-[#C8A96A] underline-offset-2 group-hover:underline pt-0.5">
                    {locale === 'bn' ? 'সম্পূর্ণ প্রোফাইল ও পোর্টফোলিও দেখুন →' : 'View Full Profile & Portfolio →'}
                  </span>
                </div>
              </Link>
            </div>
          )}

          {/* Inquiries / Curatorial Contact Action */}
          <div className="pt-6 border-t border-white/10">
            <Link
              href={`/contact?subject=${encodeURIComponent(`Artwork Inquiry: ${artwork.title_en} by ${artistName}`)}`}
              className="w-full py-3.5 px-6 rounded-xl border border-white/15 bg-white/5 hover:bg-[#C8A96A] hover:text-[#0B0908] hover:border-[#C8A96A] text-[#F4EEDF] text-xs font-mono uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
            >
              <span>{locale === 'bn' ? 'শিল্পকর্ম সম্পর্কিত অনুসন্ধান' : 'Inquire About This Artwork'}</span>
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}
