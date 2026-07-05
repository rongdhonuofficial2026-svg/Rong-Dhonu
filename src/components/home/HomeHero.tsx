import { getCmsContent } from "@/lib/cms/content"
import { HomeHeroContent } from "./HomeHeroContent"

interface HomeHeroProps {
  locale: string
  exhibition?: any
}

export async function HomeHero({ locale, exhibition }: HomeHeroProps) {
  const content = await getCmsContent('homepage', 'hero', locale)
  
  return (
    <section className="w-full relative bg-black">
      <HomeHeroContent 
        locale={locale} 
        content={content} 
        exhibition={exhibition} 
      />
    </section>
  )
}
