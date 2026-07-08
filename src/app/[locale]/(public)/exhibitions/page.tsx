import { createClient } from "@/lib/supabase/server"
import { getCmsContent } from "@/lib/cms/content"
import { Link } from "@/lib/i18n/routing"
import { generateDynamicMetadata } from "@/lib/seo"
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const settingsData = await getCmsContent('global', 'settings', locale)
  const siteName = settingsData?.site_name || 'Rongdhono'
  const faviconUrl = settingsData?.favicon_url

  return generateDynamicMetadata({
    title: locale === 'bn' ? 'প্রদর্শনী সমূহ' : 'Exhibitions',
    description: locale === 'bn' ? 'রঙধনু বার্ষিক চারুকলা প্রদর্শনীর আর্কাইভ।' : 'Archive of Rongdhono Annual Fine Arts Exhibitions.',
    url: '/exhibitions',
    imageUrl: 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=2400&auto=format&fit=crop',
    locale,
    siteName,
    faviconUrl,
  })
}

export default async function ExhibitionsArchivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: exhibitions, error } = await supabase
    .from('exhibitions')
    .select('*')
    .in('status', ['upcoming', 'ongoing', 'archived'])
    .neq('is_deleted', true)
    .order('exhibition_start', { ascending: false })

  if (error) {
    return <div className="p-8 text-center text-destructive flex items-center justify-center min-h-screen">Failed to load exhibitions.</div>
  }

  const active = exhibitions?.filter(e => e.status === 'upcoming' || e.status === 'ongoing') || []
  const past = exhibitions?.filter(e => e.status === 'archived') || []

  // Spotlight is the active one, or fallback to the latest past one
  const spotlightEx = active[0] || past[0]
  const spotlightYearShort = spotlightEx && spotlightEx.exhibition_start
    ? new Date(spotlightEx.exhibition_start).getFullYear().toString().slice(-2)
    : '26'

  // Group past by year (if spotlight is a past exhibition, we still list it in the archive timeline)
  const pastByYear = past.reduce((acc, ex) => {
    const year = ex.exhibition_start ? new Date(ex.exhibition_start).getFullYear() : 'Unknown'
    if (!acc[year]) acc[year] = []
    acc[year].push(ex)
    return acc
  }, {} as Record<string, typeof past>)

  const sortedYears = Object.keys(pastByYear).sort((a, b) => {
    if (a === 'Unknown') return 1
    if (b === 'Unknown') return -1
    return Number(b) - Number(a)
  })

  // Fetch CMS hero configurations
  const heroData = await getCmsContent('exhibitions', 'hero', locale)
  const heroTitle = heroData?.title || (locale === 'bn' ? 'প্রদর্শনী আর্কাইভ' : 'Exhibitions')
  const heroSubtitle = heroData?.subtitle || (locale === 'bn' 
    ? 'আমাদের বর্তমান এবং অতীতের সমস্ত প্রদর্শনীর একটি আর্কাইভ।' 
    : "Explore the legacy of our annual fine art exhibitions — a decade and a half of showcasing generations of Bengal's most distinctive artistic voices.")
  const heroImage = heroData?.imageUrl || 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=2400&auto=format&fit=crop'

  const formatDateRange = (startStr: string | null, endStr: string | null) => {
    if (!startStr || !endStr) return locale === 'bn' ? 'তারিখ নির্ধারিত হয়নি' : 'Dates TBD'
    const start = new Date(startStr)
    const end = new Date(endStr)
    
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }
    const endOptions: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }
    
    return `${start.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', options)} — ${end.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', endOptions)}`
  }

  return (
    <div style={{ background: 'var(--color-void)' }}>
      {/* Decorative Textures */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.35] mix-blend-overlay canvas-texture" />

      {/* ============ PAGE HERO ============ */}
      <header className="page-hero artwork">
        <img 
          src={heroImage} 
          alt="Visitors viewing paintings in a gallery" 
          loading="eager"
        />
        <div className="scrim"></div>
        <div className="frame-edge"></div>
        <div className="page-hero-inner">
          <div className="reveal in">
            <div className="eyebrow center">{locale === 'bn' ? 'মিউজিয়াম কালানুক্রম' : 'Museum Chronology'}</div>
            <h1>
              {locale === 'bn' ? (
                <span>প্রদর্শনী <em>ইতিহাস</em></span>
              ) : (
                <>Exhibitions <em>Through the Years</em></>
              )}
            </h1>
            <p className="page-hero-sub">
              {heroSubtitle}
            </p>
          </div>
          <div className="page-hero-meta reveal in">
            <div>
              <b>{exhibitions?.length || 0}</b>
              <span>{locale === 'bn' ? 'মোট প্রদর্শনী' : 'Exhibitions'}</span>
            </div>
            <div>
              <b>{active.length}</b>
              <span>{locale === 'bn' ? 'চলমান / আসন্ন' : 'Upcoming'}</span>
            </div>
            <div>
              <b>2012</b>
              <span>{locale === 'bn' ? 'প্রতিষ্ঠা বছর' : 'Founding Year'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ============ UPCOMING / FEATURED SPOTLIGHT ============ */}
      {spotlightEx && (
        <section className="spotlight artwork" id="upcoming">
          <img 
            src={spotlightEx.hero_image_url || 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=2400&auto=format&fit=crop'} 
            alt={locale === 'bn' && spotlightEx.theme_bn ? spotlightEx.theme_bn : spotlightEx.theme_en} 
            loading="lazy"
          />
          <div className="scrim"></div>
          <div className="spotlight-bgtext">{spotlightYearShort}</div>
          <div className="spotlight-inner">
            <div className="eyebrow reveal in">
              {spotlightEx.status === 'ongoing' 
                ? (locale === 'bn' ? 'চলমান প্রদর্শনী' : 'Ongoing Exhibition') 
                : (locale === 'bn' ? 'আসন্ন প্রদর্শনী' : 'Upcoming Exhibition')}
            </div>
            <h2 className="reveal in">
              {locale === 'bn' && spotlightEx.theme_bn ? spotlightEx.theme_bn : spotlightEx.theme_en}
              <em> — {spotlightEx.exhibition_start ? new Date(spotlightEx.exhibition_start).getFullYear() : ''}</em>
            </h2>
            <p className="spotlight-sub reveal in">
              {locale === 'bn' && spotlightEx.description_bn ? spotlightEx.description_bn : spotlightEx.description_en}
            </p>
            <div className="spotlight-card reveal in">
              <div className="spotlight-detail">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 8h14M7 2v3M13 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div>
                  <b>{formatDateRange(spotlightEx.exhibition_start, spotlightEx.exhibition_end)}</b>
                  <span>{locale === 'bn' ? 'প্রতিদিন, সকাল ১০টা - রাত ৮টা' : 'Daily, 10 AM – 8 PM'}</span>
                </div>
              </div>
              <div className="spotlight-detail">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 18s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <div>
                  <b>{locale === 'bn' && spotlightEx.venue_bn ? spotlightEx.venue_bn : spotlightEx.venue_en}</b>
                  <span>{locale === 'bn' ? 'বহরমপুর, পশ্চিমবঙ্গ' : 'Berhampore, West Bengal'}</span>
                </div>
              </div>
              <span className="spotlight-tag">
                {spotlightEx.status === 'ongoing' 
                  ? (locale === 'bn' ? 'চলমান' : 'Live Now') 
                  : (locale === 'bn' ? 'শীঘ্রই শুরু' : 'Opening Soon')}
              </span>
              <Link href={`/exhibitions/${spotlightEx.id}`} className="btn btn-ink btn-sm magnetic" style={{ marginLeft: 'auto' }}>
                {locale === 'bn' ? 'বিস্তারিত দেখুন →' : 'Explore Exhibition →'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ============ BEHIND THE CURATION ============ */}
      <section className="about" id="curation">
        <div className="about-grid">
          <div className="about-visual reveal in">
            <div className="mission-img-main artwork">
              <img 
                src="https://images.unsplash.com/photo-1531913764164-f85c52e6e654?q=80&w=1200&auto=format&fit=crop" 
                alt="Studio painting hung for exhibition" 
                loading="lazy"
              />
              <div className="scrim soft"></div>
              <div className="frame-edge"></div>
            </div>
          </div>
          <div className="about-copy reveal in">
            <div className="eyebrow on-paper">{locale === 'bn' ? 'কিউরেশনের অন্তরালে' : 'Behind the Curation'}</div>
            <h2>
              {locale === 'bn' 
                ? <>একটি ফ্রেম ঝোলানোর আগেই <b>প্রতিটি দেয়াল পরিকল্পিত হয়।</b></>
                : <>Every wall is planned before a single frame <b>is ever hung.</b></>}
            </h2>
            <p className="mission-body">
              {locale === 'bn'
                ? 'আমাদের কিউরেটর দল প্রতিটি প্রদর্শনীর বিন্যাস সাজাতে কয়েক মাস সময় নেয় — প্রতিষ্ঠিত শিল্পীদের সাথে উদীয়মান শিল্পীদের কাজের সামঞ্জস্য করা হয়। যার ফলে প্রদর্শনীর মধ্য দিয়ে একটি চমৎকার গল্প ফুটে ওঠে।'
                : 'Our curatorial team spends months sequencing each exhibition — pairing emerging voices with established names, and letting colour, material and narrative guide the walk through the gallery. The result is a show that reads like a single, continuous story.'}
            </p>
          </div>
        </div>
      </section>

      {/* ============ PAST EXHIBITIONS TIMELINE ============ */}
      <section className="timeline-section" id="past">
        <div className="timeline-head reveal in">
          <h2>{locale === 'bn' ? 'অতীতের প্রদর্শনীসমূহ' : 'Past Exhibitions'}</h2>
          <span className="timeline-count">
            {past.length} {locale === 'bn' ? 'টি প্রদর্শনী আর্কাইভে রয়েছে' : 'Exhibitions Archived'}
          </span>
        </div>

        {sortedYears.map((year, yIdx) => (
          <div key={year}>
            <div className="timeline-year reveal in">{year}</div>
            {pastByYear[year].map((ex: any) => {
              const title = locale === 'bn' && ex.theme_bn ? ex.theme_bn : ex.theme_en
              const dateRange = formatDateRange(ex.exhibition_start, ex.exhibition_end)
              const venue = locale === 'bn' && ex.venue_bn ? ex.venue_bn : ex.venue_en

              return (
                <div key={ex.id} className="expo-row reveal in">
                  <div className="expo-row-media artwork">
                    <img 
                      src={ex.hero_image_url || 'https://images.unsplash.com/photo-1549289524-06cf8837ace5?q=80&w=1200&auto=format&fit=crop'} 
                      alt={title} 
                      loading="lazy"
                    />
                    <div className="scrim"></div>
                    <div className="frame-edge"></div>
                    <span className="expo-row-tag">{locale === 'bn' ? 'আর্কাইভকৃত' : 'Archived'}</span>
                  </div>
                  <div className="expo-row-info">
                    <h3>{title}</h3>
                    <div className="expo-detail">
                      <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                        <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M3 8h14M7 2v3M13 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span>{dateRange}</span>
                    </div>
                    <div className="expo-detail">
                      <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                        <path d="M10 18s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      <span>{venue}</span>
                    </div>
                    <Link href={`/exhibitions/${ex.id}`} className="about-link">
                      {locale === 'bn' ? 'প্রদর্শনী দেখুন' : 'Explore Exhibition'}{' '}
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </section>

      {/* ============ CURATOR NOTE + VISITOR INFORMATION ============ */}
      <section className="curator-section">
        <div className="curator-grid">
          <div className="curator-quote reveal in">
            <div className="curator-portrait artwork">
              <img 
                src="https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=700&auto=format&fit=crop" 
                alt="Curator installing artwork" 
                loading="lazy"
              />
              <div className="scrim soft"></div>
              <div className="frame-edge"></div>
            </div>
            <div className="eyebrow">{locale === 'bn' ? 'কিউরেটরের বার্তা' : "Curator's Note"}</div>
            <div className="testi-mark">"</div>
            <p>
              {locale === 'bn'
                ? 'আমাদের আয়োজিত প্রতিটি প্রদর্শনী হচ্ছে বাঙালি শিল্পীদের প্রজন্মের মধ্যকার কথোপকথন — নতুন কাজগুলো সব সময়ই পূর্বসূরিদের সৃষ্টির সাথে ডায়ালগে যুক্ত হয়। এই বছরও তার ব্যতিক্রম নয়।'
                : 'Every exhibition we host is a conversation between generations of Bengali artists — the newest works always speak in dialogue with those who came before them. This year is no exception.'}
            </p>
            <div className="sig">{locale === 'bn' ? '— রঙধনু কিউরেটর দল' : '— Rongdhono Curatorial Team'}</div>
          </div>
          
          <div className="visitor-info reveal in">
            <div className="eyebrow">{locale === 'bn' ? 'দর্শনার্থীদের তথ্য' : 'Visitor Information'}</div>
            <div className="visitor-row">
              <div className="visitor-icon">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M10 18s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <b>{locale === 'bn' ? 'স্থান' : 'Venue'}</b>
                <span>
                  {locale === 'bn'
                    ? 'সিলভার থ্রেড আর্ট গ্যালারি, রবীন্দ্র ভবনের বিপরীতে (দক্ষিণ মিলনায়তন), বহরমপুর, পশ্চিমবঙ্গ, ভারত'
                    : 'Silver Thread Art Gallery, Opposite Rabindra Bhavan (Southern Auditorium), Berhampore, West Bengal, India'}
                </span>
              </div>
            </div>
            <div className="visitor-row">
              <div className="visitor-icon">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M3 8h14" stroke="currentColor" stroke-width="1.5"/>
                </svg>
              </div>
              <div>
                <b>{locale === 'bn' ? 'গ্যালারির সময়সূচী' : 'Gallery Hours'}</b>
                <span>
                  {locale === 'bn'
                    ? 'সোমবার – শনিবার, সকাল ১০:০০ টা – রাত ৮:০০ টা। রবিবার ব্যক্তিগত কিউরেশনের জন্য বন্ধ।'
                    : 'Monday – Saturday, 10:00 AM – 8:00 PM. Sunday closed for private curation.'}
                </span>
              </div>
            </div>
            <div className="visitor-row">
              <div className="visitor-icon">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M3 10h14M10 3v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <b>{locale === 'bn' ? 'প্রবেশ মূল্য' : 'Admission'}</b>
                <span>
                  {locale === 'bn'
                    ? 'সকলের জন্য প্রবেশাধিকার সম্পূর্ণ ফ্রি। অনুরোধের ভিত্তিতে ব্যক্তিগত গ্রুপ ট্যুরের ব্যবস্থা রয়েছে।'
                    : 'Free entry for all visitors. Private group tours available on request.'}
                </span>
              </div>
            </div>
            <Link href="/contact" className="about-link" style={{ marginTop: '24px' }}>
              {locale === 'bn' ? 'যোগাযোগ করুন' : 'Plan Your Visit'}{' '}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ GALLERY + CATALOG CROSS-PROMO ============ */}
      <section className="collection">
        <div className="section-head reveal in">
          <h2>{locale === 'bn' ? 'অনুসন্ধান অব্যাহত রাখুন' : 'Continue Exploring'}</h2>
          <p>
            {locale === 'bn' 
              ? 'আমাদের ছবির আর্কাইভে প্রবেশ করুন অথবা প্রকাশিত ক্যাটালগ সমূহের লাইব্রেরি দেখুন।'
              : 'Step deeper into the visual archive or browse our full library of exhibition publications.'}
          </p>
        </div>
        <div className="album-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)', maxWidth: '900px', margin: '0 auto' }}>
          <div className="album-card reveal in">
            <div className="album-media artwork">
              <img 
                src="https://images.unsplash.com/photo-1531913764164-f85c52e6e654?q=80&w=1200&auto=format&fit=crop" 
                alt="Gallery wall" 
                loading="lazy"
              />
              <div className="scrim"></div>
              <div className="frame-edge"></div>
            </div>
            <div className="album-body">
              <h3>{locale === 'bn' ? 'গ্যালারি প্রিভিউ' : 'Gallery Preview'}</h3>
              <p>
                {locale === 'bn'
                  ? 'প্রতিটি প্রদর্শনীর ছবির অ্যালবাম, উদ্বোধনী অনুষ্ঠান এবং নেপথ্যের মুহূর্তগুলো দেখুন।'
                  : 'Walk through photographs, ceremonies and behind-the-scenes moments from every exhibition album.'}
              </p>
              <Link href="/gallery" className="album-link">
                {locale === 'bn' ? 'গ্যালারি দেখুন' : 'View Gallery'}{' '}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="album-card reveal in">
            <div className="album-media artwork">
              <img 
                src="/images/catalog_archive_promo.jpg" 
                alt="Printed exhibition catalogues" 
                loading="lazy"
              />
              <div className="scrim"></div>
              <div className="frame-edge"></div>
            </div>
            <div className="album-body">
              <h3>{locale === 'bn' ? 'ক্যাটালগ আর্কাইভ' : 'Catalog Archive'}</h3>
              <p>
                {locale === 'bn'
                  ? 'প্রবন্ধ এবং চিত্র সম্বলিত প্রতিটি প্রদর্শনীর পূর্ণাঙ্গ ডিজিটাল প্রকাশনা ডাউনলোড করুন।'
                  : 'Download the full digital publication for each exhibition, complete with essays and plates.'}
              </p>
              <Link href="/catalogs" className="album-link">
                {locale === 'bn' ? 'ক্যাটালগ দেখুন' : 'Browse Catalogs'}{' '}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
