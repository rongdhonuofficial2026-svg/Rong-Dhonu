import { getCmsContent } from "@/lib/cms/content"
import { HomeHeroContent } from "./HomeHeroContent"

interface HomeHeroProps {
  locale: string
  exhibition?: any
  stats?: any
}

export async function HomeHero({ locale, exhibition, stats }: HomeHeroProps) {
  const content = await getCmsContent('homepage', 'hero', locale)
  
  return (
    <HomeHeroContent 
      locale={locale} 
      content={content} 
      exhibition={exhibition} 
      stats={stats}
    />
  )
}
