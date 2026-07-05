import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/routing"
import { ArrowRight, Calendar, MapPin } from "lucide-react"
import Image from "next/image"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'bn' ? 'প্রদর্শনী সমূহ | রঙধনু' : 'Exhibitions | Rongdhono',
    description: locale === 'bn' ? 'রঙধনু বার্ষিক চারুকলা প্রদর্শনীর আর্কাইভ।' : 'Archive of Rongdhono Annual Fine Arts Exhibitions.'
  }
}

export default async function ExhibitionsArchivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: exhibitions, error } = await supabase
    .from('exhibitions')
    .select('*')
    .in('status', ['active', 'upcoming', 'completed', 'archived'])
    .order('year', { ascending: false })

  if (error) {
    return <div className="p-8 text-center text-destructive">Failed to load exhibitions.</div>
  }

  const active = exhibitions?.filter(e => e.status === 'active' || e.status === 'upcoming') || []
  const past = exhibitions?.filter(e => e.status === 'completed' || e.status === 'archived') || []

  return (
    <main className="min-h-screen py-16 px-4 md:px-8 max-w-7xl mx-auto space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-serif text-4xl md:text-5xl font-bold">
          {locale === 'bn' ? 'প্রদর্শনী সমূহ' : 'Exhibitions Archive'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {locale === 'bn' 
            ? 'আমাদের বর্তমান এবং অতীতের সমস্ত প্রদর্শনীর একটি আর্কাইভ।' 
            : 'Explore our current, upcoming, and past annual fine arts exhibitions.'}
        </p>
      </div>

      {active.length > 0 && (
        <section className="space-y-8">
          <h2 className="text-2xl font-bold border-b pb-2">{locale === 'bn' ? 'চলমান ও আসন্ন' : 'Current & Upcoming'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {active.map(ex => (
              <ExhibitionCard key={ex.id} exhibition={ex} locale={locale} featured />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-8">
          <h2 className="text-2xl font-bold border-b pb-2">{locale === 'bn' ? 'অতীতের প্রদর্শনী' : 'Past Exhibitions'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {past.map(ex => (
              <ExhibitionCard key={ex.id} exhibition={ex} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

function ExhibitionCard({ exhibition, locale, featured = false }: { exhibition: Record<string, any>, locale: string, featured?: boolean }) {
  const title = locale === 'bn' && exhibition.title_bn ? exhibition.title_bn : exhibition.title_en
  const venue = locale === 'bn' && exhibition.venue_bn ? exhibition.venue_bn : exhibition.venue_en
  const desc = locale === 'bn' && exhibition.description_bn ? exhibition.description_bn : exhibition.description_en

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow flex flex-col">
      <div className={`${featured ? 'h-64' : 'h-48'} relative bg-muted overflow-hidden`}>
        {exhibition.hero_image_url ? (
          <Image 
            src={exhibition.hero_image_url} 
            alt={title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-700" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-serif text-4xl text-muted-foreground opacity-20">
            {exhibition.year}
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge variant={exhibition.status === 'active' ? 'default' : 'secondary'} className="shadow-sm">
            {exhibition.status.toUpperCase()}
          </Badge>
        </div>
      </div>
      <CardContent className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-2xl font-bold line-clamp-1">{title}</h3>
          <span className="text-xl font-bold text-muted-foreground/50">{exhibition.year}</span>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground mb-6">
          {exhibition.start_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(exhibition.start_date).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric' })}
                {exhibition.end_date && ` - ${new Date(exhibition.end_date).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              </span>
            </div>
          )}
          {venue && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{venue}</span>
            </div>
          )}
        </div>

        {featured && desc && (
          <p className="text-muted-foreground line-clamp-2 mb-6">{desc}</p>
        )}

        <div className="mt-auto pt-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-between group-hover:bg-accent group-hover:text-accent-foreground" asChild>
            <Link href={`/exhibitions/${exhibition.id}`}>
              {locale === 'bn' ? 'বিস্তারিত দেখুন' : 'Explore Exhibition'}
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
