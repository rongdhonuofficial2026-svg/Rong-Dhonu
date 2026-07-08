import { getCmsContent } from "@/lib/cms/content"
import { generateDynamicMetadata } from "@/lib/seo"
import { Link } from "@/lib/i18n/routing"
import { ContactScripts } from "@/components/public/contact/ContactScripts"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const content = await getCmsContent('contact', 'hero', locale)
  const settingsData = await getCmsContent('global', 'settings', locale)
  const siteName = settingsData?.site_name || 'Rongdhono'
  const faviconUrl = settingsData?.favicon_url
  return generateDynamicMetadata({
    title: content.title || "Contact Us",
    description: content.subtitle || "Get in touch with the artists' collective.",
    url: '/contact',
    locale,
    siteName,
    faviconUrl
  })
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const heroContent = await getCmsContent('contact', 'hero', locale)
  const infoContent = await getCmsContent('contact', 'info', locale)

  return (
    <main className="w-full">
      <ContactScripts />
      
      {/* ============ CONTACT HERO ============ */}
      <header className="contact-hero artwork">
        <img 
          src="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2400&auto=format&fit=crop" 
          alt="Guests conversing warmly during a gallery reception" 
          loading="eager"
        />
        <div className="scrim"></div>
        <div className="frame-edge"></div>
        <div className="contact-inner">
          <div className="eyebrow reveal">{locale === 'bn' ? "পরিদর্শন ও সংযোগ" : "Visit & Connect"}</div>
          <h1 className="reveal" dangerouslySetInnerHTML={{
            __html: heroContent.title || (locale === 'bn' ? "যোগাযোগ <em>করুন</em>" : "Get in <em>Touch</em>")
          }} />
          <p className="reveal">
            {heroContent.subtitle || (locale === 'bn' 
              ? "আমরা আপনার কথা শুনতে চাই। আমাদের সিলভার থ্রেড আর্ট গ্যালারিতে পরিদর্শন করুন, অথবা নিচে একটি বার্তা পাঠান — আমাদের কিউরেটরিয়াল দল ব্যক্তিগতভাবে প্রতিটি অনুসন্ধানের উত্তর দেয়।" 
              : "We would love to hear from you. Visit us at the Silver Thread Art Gallery, or send a note below — our curatorial team replies personally to every inquiry.")}
          </p>
        </div>
      </header>

      {/* ============ CONTACT BODY ============ */}
      <section className="contact-body">
        <div className="contact-grid">

          <div className="contact-col-left">
            <div className="info-card reveal">
              <div className="info-row">
                <div className="info-icon">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M10 18s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10z" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div>
                  <div className="info-label">{locale === 'bn' ? "ঠিকানা" : "Location"}</div>
                  <b>{infoContent.venue || "Silver Thread Art Gallery"}</b>
                  <span>{infoContent.address || "Opposite Rabindra Bhavan (Southern Auditorium), Berhampore, West Bengal, India"}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <rect x="2.5" y="4" width="15" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 5.5l7 5.5 7-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="info-label">{locale === 'bn' ? "ইমেইল" : "Email"}</div>
                  <b>{infoContent.email || "contact@rongdhono.art"}</b>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M4 3h3l2 5-2 1a10 10 0 005 5l1-2 5 2v3a2 2 0 01-2 2 15 15 0 01-14-14 2 2 0 012-2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="info-label">{locale === 'bn' ? "ফোন" : "Phone"}</div>
                  <b>{infoContent.phone || "+91 98765 43210"}</b>
                </div>
              </div>
              
              <div className="hours-block">
                <div className="hours-head">
                  <span>{locale === 'bn' ? "গ্যালারি খোলা থাকার সময়" : "Gallery Hours"}</span>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="hours-row">
                  <span>{locale === 'bn' ? "সোম – শনি" : "Monday – Saturday"}</span>
                  <b>{infoContent.hours_weekdays || (locale === 'bn' ? "১০:০০ AM – ৮:০০ PM" : "10:00 AM – 8:00 PM")}</b>
                </div>
                <div className="hours-row">
                  <span>{locale === 'bn' ? "রবিবার" : "Sunday"}</span>
                  <b>{infoContent.hours_sunday || (locale === 'bn' ? "ব্যক্তিগত কিউরেশনের জন্য বন্ধ" : "Closed for Private Curation")}</b>
                </div>
              </div>
            </div>

            {/* Embedded Directions Card */}
            <div className="map-card reveal artwork">
              <img 
                src="/images/placeholders/hero.webp" 
                alt="Rongdhono Gallery Map Location" 
                loading="lazy" 
              />
              <div className="scrim soft"></div>
              <div className="frame-edge"></div>
              <div className="map-pin-label">
                <b>Rongdhono Gallery</b>
                <span>{locale === 'bn' ? "দিকনির্দেশ পান" : "Get Directions"}</span>
              </div>
            </div>

            {/* Explore Cards */}
            <div className="visit-preview reveal">
              <Link href="/gallery" className="visit-preview-tile artwork">
                <img 
                  src="https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=900&auto=format&fit=crop" 
                  alt="Curator installing artwork before opening" 
                  loading="lazy"
                />
                <div className="scrim"></div>
                <div className="frame-edge"></div>
                <div className="visit-preview-tile-label">
                  {locale === 'bn' ? "গ্যালারি অন্বেষণ করুন" : "Explore the Gallery"}{" "}
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </Link>
              <Link href="/exhibitions" className="visit-preview-tile artwork">
                <img 
                  src="https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=900&auto=format&fit=crop" 
                  alt="Ribbon cutting ceremony at the gallery entrance" 
                  loading="lazy"
                />
                <div className="scrim"></div>
                <div className="frame-edge"></div>
                <div className="visit-preview-tile-label">
                  {locale === 'bn' ? "প্রদর্শনী দেখুন" : "See Exhibitions"}{" "}
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Right Column: Contact Form */}
          <div className="form-card reveal">
            <div className="form-eyebrow">{locale === 'bn' ? "অনুসন্ধান ও অর্জন" : "Inquiries & Acquisitions"}</div>
            <h2>{locale === 'bn' ? "আমাদের একটি বার্তা পাঠান" : "Send a Message"}</h2>
            <p>
              {locale === 'bn' 
                ? "প্রদর্শনী বিবরণ, ব্যক্তিগত প্রদর্শনী, বা শিল্পকর্ম অর্জনের জন্য, দয়া করে নিচে আপনার বিবরণ দিন এবং আমাদের কিউরেটরিয়াল দল আপনাকে সহায়তা করবে।" 
                : "For exhibition details, private viewings, or artwork acquisitions, please leave your details below and our curatorial team will assist you."}
            </p>

            <div className="inquiry-types">
              <span className="inquiry-type active">{locale === 'bn' ? "সাধারণ অনুসন্ধান" : "General Inquiry"}</span>
              <span className="inquiry-type">{locale === 'bn' ? "শিল্পী আবেদন" : "Artist Application"}</span>
              <span className="inquiry-type">{locale === 'bn' ? "গ্যালারি পরিদর্শন" : "Gallery Visit"}</span>
              <span className="inquiry-type">{locale === 'bn' ? "আহরণ" : "Acquisition"}</span>
            </div>

            <form>
              <div className="field-row">
                <div className="field">
                  <label>{locale === 'bn' ? "সম্পূর্ণ নাম" : "Full Name"}</label>
                  <input 
                    type="text" 
                    placeholder={locale === 'bn' ? "যেমন: জেন ডো" : "e.g. Jane Doe"} 
                    required 
                  />
                </div>
                <div className="field">
                  <label>{locale === 'bn' ? "ইমেইল ঠিকানা" : "Email Address"}</label>
                  <input 
                    type="email" 
                    placeholder="jane@example.com" 
                    required 
                  />
                </div>
              </div>
              <div className="field" style={{ marginBottom: '30px' }}>
                <label>{locale === 'bn' ? "অনুসন্ধানের বিষয়" : "Subject of Inquiry"}</label>
                <input 
                  type="text" 
                  placeholder={locale === 'bn' ? "আমরা আপনাকে কীভাবে সাহায্য করতে পারি?" : "How can we assist you?"} 
                />
              </div>
              <div className="field" style={{ marginBottom: '8px' }}>
                <label>{locale === 'bn' ? "বার্তা" : "Message"}</label>
                <textarea 
                  rows={4} 
                  placeholder={locale === 'bn' ? "অনুগ্রহ করে আপনার অনুসন্ধানের বিবরণ শেয়ার করুন..." : "Please share the details of your inquiry…"}
                ></textarea>
              </div>
              <div className="form-submit">
                <button type="submit" className="btn btn-paper magnetic">
                  {locale === 'bn' ? "অনুসন্ধান জমা দিন →" : "Submit Inquiry →"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>
    </main>
  )
}
