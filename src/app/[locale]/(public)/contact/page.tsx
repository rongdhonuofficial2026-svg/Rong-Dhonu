import { getCmsContent } from "@/lib/cms/content"
import { generateDynamicMetadata } from "@/lib/seo"
import { SectionHeading } from "@/components/museum/section-heading"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail } from "lucide-react"

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const content = await getCmsContent('contact', 'hero', locale)
  return generateDynamicMetadata({
    title: content.title || "Contact Us",
    description: content.subtitle || "Get in touch with the Rongdhono artists' collective.",
    url: '/contact',
    locale
  })
}

export default async function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  const heroContent = await getCmsContent('contact', 'hero', locale)
  const infoContent = await getCmsContent('contact', 'info', locale)

  return (
    <main className="flex flex-col w-full min-h-screen pt-32 pb-24 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeading 
          title={heroContent.title || "Get in Touch"} 
          subtitle={heroContent.subtitle || "We would love to hear from you."}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-16 max-w-6xl mx-auto">
          {/* Contact Info & Map */}
          <div className="space-y-12">
            <div className="bg-muted/30 p-8 rounded-2xl border border-border space-y-6">
              <h3 className="font-serif text-2xl font-bold">{locale === 'bn' ? "যোগাযোগের তথ্য" : "Contact Information"}</h3>
              
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-accent shrink-0" />
                <div>
                  <p className="font-bold">{infoContent.venue}</p>
                  <p className="text-muted-foreground">{infoContent.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-accent shrink-0" />
                <p className="text-muted-foreground">{infoContent.email}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <Phone className="w-6 h-6 text-accent shrink-0" />
                <p className="text-muted-foreground">{infoContent.phone}</p>
              </div>
            </div>
            
            <div className="w-full h-80 bg-muted rounded-2xl overflow-hidden border border-border flex items-center justify-center">
              {/* This would be an iframe for Google Maps in production */}
              <p className="text-muted-foreground font-medium">Google Maps Integration</p>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-card p-10 rounded-2xl border border-border shadow-sm">
            <h3 className="font-serif text-2xl font-bold mb-8">{locale === 'bn' ? "আমাদের একটি বার্তা পাঠান" : "Send us a Message"}</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{locale === 'bn' ? "নাম" : "Name"}</label>
                  <Input placeholder={locale === 'bn' ? "আপনার নাম" : "Your name"} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{locale === 'bn' ? "ইমেইল" : "Email"}</label>
                  <Input type="email" placeholder={locale === 'bn' ? "আপনার ইমেইল" : "Your email"} className="bg-background" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{locale === 'bn' ? "বিষয়" : "Subject"}</label>
                <Input placeholder={locale === 'bn' ? "কীভাবে আমরা সাহায্য করতে পারি?" : "How can we help?"} className="bg-background" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{locale === 'bn' ? "বার্তা" : "Message"}</label>
                <Textarea placeholder={locale === 'bn' ? "আপনার বার্তা লিখুন..." : "Write your message here..."} rows={6} className="bg-background resize-none" />
              </div>
              
              <Button type="submit" size="lg" className="w-full">
                {locale === 'bn' ? "বার্তা পাঠান" : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
