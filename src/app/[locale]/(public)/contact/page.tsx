import { getCmsContent } from "@/lib/cms/content"
import { generateDynamicMetadata } from "@/lib/seo"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react"
import { PremiumImage } from "@/components/ui/PremiumImage"

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
    <main className="flex flex-col w-full min-h-screen bg-[#EFE6D2]">
      
      {/* Decorative Textures */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.35] mix-blend-overlay canvas-texture" />

      {/* Cinematic Hero */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex flex-col justify-center overflow-hidden bg-[#0B0908]">
        <div className="absolute inset-0 z-0">
          <PremiumImage 
            src="/images/placeholders/exhibition.webp"
            fallbackSrc="/images/placeholders/exhibition.webp"
            alt="Gallery Atmosphere"
            fill
            priority
            className="object-cover opacity-40 sepia-[0.3] mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#EFE6D2] via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0908]/90 via-black/30 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 max-w-7xl pt-20">
          <div className="max-w-2xl space-y-6">
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-[#F4EEDF] drop-shadow-xl">
              {heroContent.title || (locale === 'bn' ? "যোগাযোগ" : "Get in Touch")}
            </h1>
            <div className="w-16 h-[2px] bg-[#F4C662]/50" />
            <p className="text-xl md:text-2xl text-[#F4EEDF]/80 font-light leading-relaxed">
              {heroContent.subtitle || (locale === 'bn' ? "আমরা আপনার কথা শুনতে চাই" : "We would love to hear from you. Reach out for inquiries, partnerships, or general questions.")}
            </p>
          </div>
        </div>
      </section>

      <div className="container relative z-20 mx-auto px-6 max-w-7xl -mt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Left Column: Contact Info & Map */}
          <div className="lg:col-span-5 space-y-8">
            {/* Premium Info Cards */}
            <div className="bg-[#151210] p-10 md:p-14 text-[#F4EEDF] border border-white/[0.08] shadow-2xl rounded-none space-y-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4C662]/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="relative z-10 space-y-10">
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#B4233A] group-hover:border-[#B4233A] transition-colors duration-500 shadow-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">{locale === 'bn' ? "ঠিকানা" : "Location"}</p>
                    <p className="font-serif text-2xl font-medium">{infoContent.venue || "The Grand Gallery"}</p>
                    <p className="text-white/70 font-light mt-2 leading-relaxed max-w-xs">{infoContent.address || "123 Arts District, Dhaka, Bangladesh"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#B4233A] group-hover:border-[#B4233A] transition-colors duration-500 shadow-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">{locale === 'bn' ? "ইমেইল" : "Email"}</p>
                    <p className="font-serif text-xl font-medium text-white/90">{infoContent.email || "inquiries@rongdhono.art"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#B4233A] group-hover:border-[#B4233A] transition-colors duration-500 shadow-lg">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">{locale === 'bn' ? "ফোন" : "Phone"}</p>
                    <p className="font-serif text-xl font-medium text-white/90">{infoContent.phone || "+880 1234 567890"}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-10 border-t border-white/10 relative z-10">
                <div className="flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <span>{locale === 'bn' ? "গ্যালারি খোলা থাকার সময়" : "Gallery Hours"}</span>
                  <Clock className="w-4 h-4 text-[#F4C662]" />
                </div>
                <p className="font-serif text-lg mt-5 text-white/90">Monday – Saturday: 10:00 AM — 08:00 PM</p>
                <p className="font-serif text-lg mt-1 text-white/60">Sunday: Closed for Private Curation</p>
              </div>
            </div>

            {/* Embedded Map */}
            <div className="w-full aspect-video md:aspect-square bg-[#F4EEDF] relative rounded-none overflow-hidden shadow-xl border border-[#DCCFAE] group">
              <PremiumImage 
                src="/images/placeholders/hero.webp" 
                fallbackSrc="/images/placeholders/hero.webp" 
                alt="Gallery Map Placeholder" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-[3s]" 
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                <div className="bg-[#FDFBF7] border border-[#DCCFAE] px-6 py-4 shadow-2xl text-center">
                  <p className="font-serif font-bold text-lg text-[#1E1A16]">Rongdhono Gallery</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#B4233A] mt-1">Get Directions</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="w-full bg-[#F4EEDF] p-10 md:p-16 border border-[#DCCFAE] shadow-2xl rounded-none h-full">
              <div className="space-y-6 mb-12">
                <h2 className="eyebrow on-paper">
                  {locale === 'bn' ? "অনুসন্ধান" : "Inquiries & Acquisitions"}
                </h2>
                <h3 className="font-serif text-4xl md:text-5xl font-bold text-[#1E1A16]">
                  {locale === 'bn' ? "আমাদের একটি বার্তা পাঠান" : "Send a Message"}
                </h3>
                <p className="text-[#5C5347] font-light text-lg">
                  For exhibition details, private viewings, or artwork acquisitions, please leave your details below and our curatorial team will assist you.
                </p>
              </div>
              
              <form className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3 relative group">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E1A16]/60 transition-colors group-focus-within:text-[#B4233A]">
                      {locale === 'bn' ? "নাম" : "Full Name"}
                    </label>
                    <Input 
                      placeholder={locale === 'bn' ? "আপনার নাম" : "e.g. Jane Doe"} 
                      className="bg-transparent border-0 border-b-2 border-[#DCCFAE] rounded-none px-0 h-12 text-lg focus-visible:ring-0 focus-visible:border-[#B4233A] transition-all shadow-none placeholder:text-[#5C5347]/30 text-[#1E1A16]" 
                    />
                  </div>
                  
                  <div className="space-y-3 relative group">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E1A16]/60 transition-colors group-focus-within:text-[#B4233A]">
                      {locale === 'bn' ? "ইমেইল" : "Email Address"}
                    </label>
                    <Input 
                      type="email" 
                      placeholder={locale === 'bn' ? "আপনার ইমেইল" : "jane@example.com"} 
                      className="bg-transparent border-0 border-b-2 border-[#DCCFAE] rounded-none px-0 h-12 text-lg focus-visible:ring-0 focus-visible:border-[#B4233A] transition-all shadow-none placeholder:text-[#5C5347]/30 text-[#1E1A16]" 
                    />
                  </div>
                </div>
                
                <div className="space-y-3 relative group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E1A16]/60 transition-colors group-focus-within:text-[#B4233A]">
                    {locale === 'bn' ? "বিষয়" : "Subject of Inquiry"}
                  </label>
                  <Input 
                    placeholder={locale === 'bn' ? "কীভাবে আমরা সাহায্য করতে পারি?" : "How can we assist you?"} 
                    className="bg-transparent border-0 border-b-2 border-[#DCCFAE] rounded-none px-0 h-12 text-lg focus-visible:ring-0 focus-visible:border-[#B4233A] transition-all shadow-none placeholder:text-[#5C5347]/30 text-[#1E1A16]" 
                  />
                </div>
                
                <div className="space-y-3 relative group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E1A16]/60 transition-colors group-focus-within:text-[#B4233A]">
                    {locale === 'bn' ? "বার্তা" : "Message"}
                  </label>
                  <Textarea 
                    placeholder={locale === 'bn' ? "আপনার বার্তা লিখুন..." : "Please share the details of your inquiry..."} 
                    rows={5} 
                    className="bg-transparent border-0 border-b-2 border-[#DCCFAE] rounded-none px-0 text-lg focus-visible:ring-0 focus-visible:border-[#B4233A] resize-none transition-all shadow-none placeholder:text-[#5C5347]/30 text-[#1E1A16]" 
                  />
                </div>
                
                <div className="pt-4">
                  <Button type="button" className="btn btn-gold font-bold text-[13px] uppercase tracking-widest rounded-full w-full md:w-auto active:scale-[0.97] shadow-xl">
                    {locale === 'bn' ? "বার্তা পাঠান" : "Submit Inquiry"}
                    <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
