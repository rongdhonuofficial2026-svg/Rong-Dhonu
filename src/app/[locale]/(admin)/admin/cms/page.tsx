import { createClient } from "@/lib/supabase/server"
import { CMSForm } from "@/components/admin/CMSForm"
import Image from "next/image"
import { Type, Globe, History } from "lucide-react"

export default async function CMSManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: cmsHero } = await supabase
    .from('cms_content')
    .select('*')
    .eq('page', 'homepage')
    .eq('section', 'hero')
    .single()

  const { data: cmsAbout } = await supabase
    .from('cms_content')
    .select('*')
    .eq('page', 'homepage')
    .eq('section', 'about')
    .single()

  // Fallback structure if database is empty
  const defaultContent = {
    hero: {
      title: locale === 'bn' ? "রংধনু বার্ষিক চারুকলা প্রদর্শনী" : "Rongdhono Annual Fine Arts Exhibition",
      subtitle: locale === 'bn' ? "বাংলাদেশের প্রতিভাবান শিল্পীদের উদযাপন" : "Celebrating the finest artists of Bangladesh."
    },
    about: {
      title: locale === 'bn' ? "আমাদের সম্পর্কে" : "About Us",
      content: "Rongdhono is a prestigious annual fine arts exhibition..."
    }
  }

  const initialData = {
    hero: locale === 'bn' ? (cmsHero?.content_bn || defaultContent.hero) : (cmsHero?.content_en || defaultContent.hero),
    about: locale === 'bn' ? (cmsAbout?.content_bn || defaultContent.about) : (cmsAbout?.content_en || defaultContent.about)
  }

  return (
    <div className="space-y-12 pb-20">
      
      {/* Immersive Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-end p-8 md:p-12 museum-shadow">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/cms_hero.png" 
            alt="Content Management Studio" 
            fill 
            className="object-cover object-center image-reveal scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-3xl text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/20 mb-6">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium tracking-widest uppercase">Digital Publishing</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight text-shadow-elegant">
            Content <span className="text-gradient-gold">Studio</span>
          </h1>
          <p className="text-white/80 text-lg font-light">
            Architect the public narrative. Manage homepage text, hero phrases, and about sections globally across English and Bengali localizations.
          </p>
        </div>
      </section>

      {/* Editor Space */}
      <section>
        <CMSForm initialData={initialData} locale={locale} />
      </section>
    </div>
  )
}
