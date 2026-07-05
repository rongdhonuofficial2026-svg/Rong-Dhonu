import { getCmsContent } from "@/lib/cms/content"
import { generateDynamicMetadata } from "@/lib/seo"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react"
import Image from "next/image"

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
    <main className="flex flex-col w-full min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        
        {/* Left Pane - Contact Info & Atmosphere */}
        <div className="relative flex flex-col justify-between p-12 md:p-24 bg-[#111111] text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://images.unsplash.com/photo-1577083552431-5e4fcb749667?auto=format&fit=crop&q=80&w=1200"
              alt="Gallery Atmosphere"
              fill
              className="object-cover opacity-20 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/80 via-transparent to-[#111111]" />
          </div>
          
          <div className="relative z-10 space-y-6 pt-16">
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight">
              {heroContent.title || (locale === 'bn' ? "যোগাযোগ" : "Get in Touch")}
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-light max-w-md">
              {heroContent.subtitle || (locale === 'bn' ? "আমরা আপনার কথা শুনতে চাই" : "We would love to hear from you. Reach out for inquiries, partnerships, or general questions.")}
            </p>
          </div>
          
          <div className="relative z-10 mt-24 space-y-16">
            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-2">{locale === 'bn' ? "ঠিকানা" : "Location"}</p>
                  <p className="font-serif text-xl font-medium">{infoContent.venue}</p>
                  <p className="text-white/60 font-light mt-1 max-w-xs">{infoContent.address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-2">{locale === 'bn' ? "ইমেইল" : "Email"}</p>
                  <p className="font-serif text-xl font-medium">{infoContent.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-2">{locale === 'bn' ? "ফোন" : "Phone"}</p>
                  <p className="font-serif text-xl font-medium">{infoContent.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="pt-12 border-t border-white/10">
              <div className="flex items-center justify-between text-white/40 text-xs font-bold uppercase tracking-[0.2em]">
                <span>{locale === 'bn' ? "গ্যালারি খোলা থাকার সময়" : "Gallery Hours"}</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="font-serif text-lg mt-4 text-white/80">Mon - Sat: 10:00 AM — 08:00 PM</p>
              <p className="font-serif text-lg text-white/80">Sunday: Closed</p>
            </div>
          </div>
        </div>
        
        {/* Right Pane - Contact Form */}
        <div className="flex items-center justify-center p-6 md:p-12 lg:p-24 bg-[#F5F5F0]">
          <div className="w-full max-w-lg space-y-12 bg-white/40 backdrop-blur-3xl p-10 md:p-14 border border-white/60 shadow-2xl">
            <div className="space-y-4">
              <h2 className="text-xs tracking-[0.3em] font-bold uppercase text-muted-foreground">
                {locale === 'bn' ? "অনুসন্ধান" : "Inquiries"}
              </h2>
              <h3 className="font-serif text-4xl font-bold">
                {locale === 'bn' ? "আমাদের একটি বার্তা পাঠান" : "Send a Message"}
              </h3>
            </div>
            
            <form className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{locale === 'bn' ? "নাম" : "Full Name"}</label>
                <Input 
                  placeholder={locale === 'bn' ? "আপনার নাম" : "e.g. Jane Doe"} 
                  className="bg-transparent border-0 border-b border-border/50 rounded-none px-0 h-12 focus-visible:ring-0 focus-visible:border-black transition-colors" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{locale === 'bn' ? "ইমেইল" : "Email Address"}</label>
                <Input 
                  type="email" 
                  placeholder={locale === 'bn' ? "আপনার ইমেইল" : "jane@example.com"} 
                  className="bg-transparent border-0 border-b border-border/50 rounded-none px-0 h-12 focus-visible:ring-0 focus-visible:border-black transition-colors" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{locale === 'bn' ? "বিষয়" : "Subject"}</label>
                <Input 
                  placeholder={locale === 'bn' ? "কীভাবে আমরা সাহায্য করতে পারি?" : "How can we help?"} 
                  className="bg-transparent border-0 border-b border-border/50 rounded-none px-0 h-12 focus-visible:ring-0 focus-visible:border-black transition-colors" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{locale === 'bn' ? "বার্তা" : "Message"}</label>
                <Textarea 
                  placeholder={locale === 'bn' ? "আপনার বার্তা লিখুন..." : "Write your message here..."} 
                  rows={4} 
                  className="bg-transparent border-0 border-b border-border/50 rounded-none px-0 focus-visible:ring-0 focus-visible:border-black resize-none transition-colors" 
                />
              </div>
              
              <Button type="button" size="lg" className="w-full h-14 rounded-none uppercase tracking-[0.2em] text-xs font-bold group">
                {locale === 'bn' ? "বার্তা পাঠান" : "Submit Inquiry"}
                <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </div>
        </div>

      </div>
    </main>
  )
}
