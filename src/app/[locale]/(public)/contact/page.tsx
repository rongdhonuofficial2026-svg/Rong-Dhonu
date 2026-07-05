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
  return generateDynamicMetadata({
    title: content.title || "Contact Us",
    description: content.subtitle || "Get in touch with the Rongdhono artists' collective.",
    url: '/contact',
    locale
  })
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const heroContent = await getCmsContent('contact', 'hero', locale)
  const infoContent = await getCmsContent('contact', 'info', locale)

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#F5F5F0]">
      
      {/* Decorative Textures */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.35] mix-blend-overlay canvas-texture" />

      {/* Cinematic Hero */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex flex-col justify-center overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0 z-0">
          <PremiumImage 
            src="/images/placeholders/exhibition.webp"
            fallbackSrc="/images/placeholders/exhibition.webp"
            alt="Gallery Atmosphere"
            fill
            priority
            className="object-cover opacity-50 sepia-[0.3] mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5F0] via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 max-w-7xl pt-20">
          <div className="max-w-2xl space-y-6">
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-xl">
              {heroContent.title || (locale === 'bn' ? "যোগাযোগ" : "Get in Touch")}
            </h1>
            <div className="w-16 h-[2px] bg-accent/80" />
            <p className="text-xl md:text-2xl text-white/80 font-light leading-relaxed">
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
            <div className="bg-[#1A1A1A] p-10 md:p-14 text-white shadow-2xl rounded-sm space-y-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="relative z-10 space-y-10">
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:border-accent transition-colors duration-500 shadow-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">{locale === 'bn' ? "ঠিকানা" : "Location"}</p>
                    <p className="font-serif text-2xl font-medium">{infoContent.venue || "The Grand Gallery"}</p>
                    <p className="text-white/70 font-light mt-2 leading-relaxed max-w-xs">{infoContent.address || "123 Arts District, Dhaka, Bangladesh"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:border-accent transition-colors duration-500 shadow-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-2">{locale === 'bn' ? "ইমেইল" : "Email"}</p>
                    <p className="font-serif text-xl font-medium text-white/90">{infoContent.email || "inquiries@rongdhono.art"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:border-accent transition-colors duration-500 shadow-lg">
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
                  <Clock className="w-4 h-4" />
                </div>
                <p className="font-serif text-lg mt-5 text-white/90">Monday – Saturday: 10:00 AM — 08:00 PM</p>
                <p className="font-serif text-lg mt-1 text-white/60">Sunday: Closed for Private Curation</p>
              </div>
            </div>

            {/* Embedded Map */}
            <div className="w-full aspect-video md:aspect-square bg-muted relative rounded-sm overflow-hidden shadow-xl border border-foreground/5 group">
              <PremiumImage 
                src="/images/placeholders/hero.webp" 
                fallbackSrc="/images/placeholders/hero.webp" 
                alt="Gallery Map Placeholder" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-[3s]" 
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                <div className="bg-white/90 backdrop-blur-md px-6 py-4 shadow-2xl text-center">
                  <p className="font-serif font-bold text-lg">Rongdhono Gallery</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Get Directions</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="w-full bg-white/60 backdrop-blur-3xl p-10 md:p-16 border border-white shadow-2xl rounded-sm h-full">
              <div className="space-y-6 mb-12">
                <h2 className="text-[10px] tracking-[0.3em] font-bold uppercase text-muted-foreground">
                  {locale === 'bn' ? "অনুসন্ধান" : "Inquiries & Acquisitions"}
                </h2>
                <h3 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                  {locale === 'bn' ? "আমাদের একটি বার্তা পাঠান" : "Send a Message"}
                </h3>
                <p className="text-muted-foreground font-light text-lg">
                  For exhibition details, private viewings, or artwork acquisitions, please leave your details below and our curatorial team will assist you.
                </p>
              </div>
              
              <form className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3 relative group">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 transition-colors group-focus-within:text-foreground">
                      {locale === 'bn' ? "নাম" : "Full Name"}
                    </label>
                    <Input 
                      placeholder={locale === 'bn' ? "আপনার নাম" : "e.g. Jane Doe"} 
                      className="bg-transparent border-0 border-b-2 border-foreground/10 rounded-none px-0 h-12 text-lg focus-visible:ring-0 focus-visible:border-foreground transition-all shadow-none placeholder:text-muted-foreground/40" 
                    />
                  </div>
                  
                  <div className="space-y-3 relative group">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 transition-colors group-focus-within:text-foreground">
                      {locale === 'bn' ? "ইমেইল" : "Email Address"}
                    </label>
                    <Input 
                      type="email" 
                      placeholder={locale === 'bn' ? "আপনার ইমেইল" : "jane@example.com"} 
                      className="bg-transparent border-0 border-b-2 border-foreground/10 rounded-none px-0 h-12 text-lg focus-visible:ring-0 focus-visible:border-foreground transition-all shadow-none placeholder:text-muted-foreground/40" 
                    />
                  </div>
                </div>
                
                <div className="space-y-3 relative group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 transition-colors group-focus-within:text-foreground">
                    {locale === 'bn' ? "বিষয়" : "Subject of Inquiry"}
                  </label>
                  <Input 
                    placeholder={locale === 'bn' ? "কীভাবে আমরা সাহায্য করতে পারি?" : "How can we assist you?"} 
                    className="bg-transparent border-0 border-b-2 border-foreground/10 rounded-none px-0 h-12 text-lg focus-visible:ring-0 focus-visible:border-foreground transition-all shadow-none placeholder:text-muted-foreground/40" 
                  />
                </div>
                
                <div className="space-y-3 relative group">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 transition-colors group-focus-within:text-foreground">
                    {locale === 'bn' ? "বার্তা" : "Message"}
                  </label>
                  <Textarea 
                    placeholder={locale === 'bn' ? "আপনার বার্তা লিখুন..." : "Please share the details of your inquiry..."} 
                    rows={5} 
                    className="bg-transparent border-0 border-b-2 border-foreground/10 rounded-none px-0 text-lg focus-visible:ring-0 focus-visible:border-foreground resize-none transition-all shadow-none placeholder:text-muted-foreground/40" 
                  />
                </div>
                
                <div className="pt-4">
                  <Button type="button" className="w-full md:w-auto px-12 h-16 rounded-full bg-foreground text-background hover:bg-foreground/90 uppercase tracking-[0.2em] text-[10px] font-bold group shadow-xl hover:shadow-2xl transition-all duration-300">
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
