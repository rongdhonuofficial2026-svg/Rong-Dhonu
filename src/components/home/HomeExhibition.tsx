 
 
 
import { createClient } from "@/lib/supabase/server"
import { HomeExhibitionContent } from "./HomeExhibitionContent"

const fallbackExhibition = {
  id: 'current-fallback',
  title_en: "Annual Summer Collection 2026",
  title_bn: "বার্ষিক গ্রীষ্মকালীন সংগ্রহ ২০২৬",
  status: "upcoming" as const,
  start_date: new Date('2026-08-01'),
  end_date: new Date('2026-08-15'),
  venue_en: "Silva Tirtha Art Gallery",
  venue_bn: "সিলভা তীর্থ আর্ট গ্যালারি",
  hero_image_url: "https://images.unsplash.com/photo-1518998053401-878c735c908c?auto=format&fit=crop&q=80&w=1000"
}

export async function HomeExhibition({ locale }: { locale: string }) {
  const supabase = await createClient()
  
  const { data: exhibition } = await supabase
    .from('exhibitions')
    .select('*')
    .in('status', ['active', 'upcoming'])
    .order('start_date', { ascending: false })
    .limit(1)
    .single()

  const currentExhibition = exhibition || fallbackExhibition

  const timelineItems = [
    { id: '1', title: locale === 'bn' ? 'নিবন্ধন শুরু' : 'Registration Opens', status: 'completed' as const, date: 'January 15' },
    { id: '2', title: locale === 'bn' ? 'শিল্পকর্ম জমা' : 'Artwork Submissions', status: 'current' as const, date: 'February 1 - 28' },
    { id: '3', title: locale === 'bn' ? 'প্রদর্শনী শুরু' : 'Exhibition Starts', status: 'upcoming' as const, date: 'August 1' },
  ]

  return (
    <section className="py-32 bg-background border-y border-border overflow-hidden">
      <div className="container mx-auto px-6">
        <HomeExhibitionContent 
          locale={locale} 
          currentExhibition={currentExhibition} 
          timelineItems={timelineItems} 
        />
      </div>
    </section>
  )
}
