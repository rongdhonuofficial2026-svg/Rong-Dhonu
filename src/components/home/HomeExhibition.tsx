 
 
 
import { createClient } from "@/lib/supabase/server"
import { SectionHeading } from "@/components/museum/section-heading"
import { ExhibitionCard } from "@/components/museum/exhibition-card"
import { Timeline } from "@/components/museum/timeline"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

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
    <section className="py-24 bg-muted/20 border-y border-border">
      <div className="container mx-auto px-6">
        <SectionHeading 
          title={locale === 'bn' ? "বর্তমান প্রদর্শনী" : "Current Exhibition"} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-12 items-center">
          <div>
            <ExhibitionCard
              id={currentExhibition.id}
              title={locale === 'bn' ? (currentExhibition.title_bn || currentExhibition.title_en) : currentExhibition.title_en}
              status={currentExhibition.status as any}
              venue={locale === 'bn' ? (currentExhibition.venue_bn || currentExhibition.venue_en) : currentExhibition.venue_en}
              startDate={new Date(currentExhibition.start_date)}
              endDate={new Date(currentExhibition.end_date)}
              coverImageUrl={currentExhibition.hero_image_url}
              className="w-full max-w-xl mx-auto"
            />
          </div>
          
          <div className="space-y-10">
            <h3 className="font-serif text-3xl font-bold">
              {locale === 'bn' ? "প্রদর্শনীর সময়রেখা" : "Exhibition Timeline"}
            </h3>
            <Timeline items={timelineItems} />
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/exhibitions">
                {locale === 'bn' ? "সকল প্রদর্শনী দেখুন" : "View All Exhibitions"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
