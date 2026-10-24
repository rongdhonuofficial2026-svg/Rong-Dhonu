import { Link } from '@/lib/i18n/routing'
import { Palette, Tag, User } from 'lucide-react'

export interface ExhibitionArtwork {
  id: string
  title_en: string
  title_bn: string | null
  main_image_url: string | null
  category: string | null
  medium_en: string | null
  medium_bn?: string | null
  dimensions?: string | null
  year?: number | null
  created_at?: string | null
  profiles?: {
    id: string
    full_name_en: string | null
    full_name_bn: string | null
    avatar_url: string | null
  } | null
  exhibitions?: {
    id: string
    year: number | null
    theme_en: string | null
    theme_bn: string | null
  } | null
}

interface ExhibitionArtworksSectionProps {
  artworks: ExhibitionArtwork[]
  locale: string
  exhibitionTitle?: string
}

export function ExhibitionArtworksSection({
  artworks,
  locale,
  exhibitionTitle,
}: ExhibitionArtworksSectionProps) {
  const displayTitle = exhibitionTitle || (locale === 'bn' ? 'রংধনু ৪র্থ বার্ষিক প্রদর্শনী — শিল্পকর্ম' : 'Rongdhonu 4th Annual Exhibition — Artworks')
  const defaultHeading = locale === 'bn'
    ? `${displayTitle}`
    : 'Rongdhonu 4th Annual Exhibition — Artworks'

  const subtitle = locale === 'bn'
    ? 'রংধনুর ৪র্থ বার্ষিক শিল্প প্রদর্শনীতে অংশ নেওয়া শিল্পীদের অনন্য সৃষ্টি ও শিল্পভাবনা অন্বেষণ করুন।'
    : 'Explore the artworks and creative expressions of the artists featured in Rongdhonu’s 4th Annual Art Exhibition.'

  return (
    <section 
      id="exhibition-artworks" 
      className="relative z-10 py-16 md:py-24 border-t border-white/10"
      style={{ background: 'var(--color-void)' }}
    >
      {/* Subtle ambient museum spotlight */}
      <div 
        className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-30 mix-blend-screen"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(200, 169, 106, 0.12) 0%, transparent 80%)'
        }}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10">
        {/* Section Header */}
        <div className="section-head reveal in text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="eyebrow center text-xs font-mono uppercase tracking-[0.25em] text-[#C8A96A] mb-3">
            {locale === 'bn' ? 'অফিসিয়াল আর্ট কালেকশন' : 'Official Exhibition Collection'}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F4EEDF] font-normal tracking-tight mb-4 leading-tight">
            {defaultHeading}
          </h2>
          <p className="text-sm md:text-base text-[#F4EEDF]/70 font-light leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Empty State */}
        {artworks.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-white/10 bg-white/[0.02] max-w-xl mx-auto p-8">
            <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mx-auto mb-4 text-[#C8A96A]">
              <Palette className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl text-[#F4EEDF] font-medium mb-2">
              {locale === 'bn' ? 'শিল্পকর্ম সংকলন প্রক্রিয়াধীন' : 'Curated Artworks Preparing'}
            </h3>
            <p className="text-sm text-[#F4EEDF]/60 max-w-md mx-auto">
              {locale === 'bn'
                ? 'এই প্রদর্শনীর অনুমোদিত শিল্পকর্মগুলো ডিজিটাল আর্কাইভে যুক্ত করা হচ্ছে।'
                : 'The official artworks for this exhibition are being organized in the digital archive.'}
            </p>
          </div>
        ) : (
          /* Multi-column Artwork Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 items-start">
            {artworks.map((artwork, idx) => {
              const artworkTitle = locale === 'bn' && artwork.title_bn ? artwork.title_bn : artwork.title_en
              const profile = Array.isArray(artwork.profiles) ? artwork.profiles[0] : artwork.profiles
              const artistName = (locale === 'bn' && profile?.full_name_bn) ? profile.full_name_bn : (profile?.full_name_en ?? (locale === 'bn' ? 'অজ্ঞাত শিল্পী' : 'Unknown Artist'))
              const medium = locale === 'bn' && artwork.medium_bn ? artwork.medium_bn : artwork.medium_en
              const year = artwork.year || (artwork.created_at ? new Date(artwork.created_at).getFullYear() : null)

              return (
                <div
                  key={artwork.id}
                  className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#14110F] hover:border-[#C8A96A]/50 transition-all duration-500 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_-15px_rgba(200,169,106,0.18)] hover:-translate-y-1.5"
                >
                  {/* Artwork Image Frame */}
                  <Link
                    href={`/gallery/artwork/${artwork.id}`}
                    className="relative w-full aspect-[4/5] bg-[#0E0C0A] flex items-center justify-center overflow-hidden p-4 group-hover:bg-[#181412] transition-colors"
                  >
                    {/* Subtle spotlight inside frame */}
                    <div 
                      className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen group-hover:opacity-40 transition-opacity"
                      style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(200, 169, 106, 0.25) 0%, transparent 75%)'
                      }}
                    />

                    {artwork.main_image_url ? (
                      <img
                        src={artwork.main_image_url}
                        alt={artworkTitle}
                        loading="lazy"
                        className="max-w-full max-h-full object-contain rounded-sm transition-transform duration-700 ease-out group-hover:scale-[1.03] shadow-md"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#F4EEDF]/30 p-4 text-center">
                        <Palette className="w-10 h-10 mb-2 opacity-40" />
                        <span className="text-xs uppercase tracking-wider font-mono">No Image Available</span>
                      </div>
                    )}

                    {/* Category pill on image */}
                    {artwork.category && (
                      <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/15 text-[#F4EEDF]/90">
                        {artwork.category}
                      </span>
                    )}

                    {/* Artwork index tag */}
                    <span className="absolute top-3 right-3 z-10 text-[10px] font-mono text-[#F4EEDF]/40 tracking-wider">
                      No. {String(idx + 1).padStart(2, '0')}
                    </span>
                  </Link>

                  {/* Placard / Metadata Card Body */}
                  <div className="p-5 flex flex-col flex-1 justify-between space-y-3 bg-[#14110F]">
                    <div>
                      {/* Artwork Title Link */}
                      <h3 className="font-serif text-lg md:text-xl font-medium text-[#F4EEDF] group-hover:text-[#C8A96A] transition-colors line-clamp-1">
                        <Link href={`/gallery/artwork/${artwork.id}`} className="focus:outline-none focus:underline">
                          {artworkTitle}
                        </Link>
                      </h3>

                      {/* Artist Link */}
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-[#F4EEDF]/75 font-serif">
                        <span className="italic text-[#F4EEDF]/45 text-xs">{locale === 'bn' ? 'শিল্পী' : 'by'}</span>
                        {profile?.id ? (
                          <Link 
                            href={`/artists/${profile.id}`}
                            className="hover:text-[#C8A96A] transition-colors truncate font-normal hover:underline underline-offset-2"
                          >
                            {artistName}
                          </Link>
                        ) : (
                          <span className="truncate">{artistName}</span>
                        )}
                      </div>
                    </div>

                    {/* Metadata Footer: Medium & Year */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#F4EEDF]/50 font-mono">
                      <span className="truncate max-w-[160px]">
                        {medium || (locale === 'bn' ? 'চিত্রকর্ম' : 'Fine Artwork')}
                      </span>
                      {year && (
                        <span className="shrink-0 text-[#C8A96A] font-semibold">{year}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
