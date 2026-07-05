import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Download, BookOpen, Calendar, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function PublicCatalogsPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = await createClient()
  const t = await getTranslations('Public')

  const { data: catalogs } = await supabase
    .from('catalogs')
    .select('*, exhibitions(theme_en, theme_bn, year)')
    .eq('status', 'published')
    .order('year', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Official Catalogs</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore and download the official Rongdhonu exhibition catalogs from current and previous years.
        </p>
      </div>

      {!catalogs || catalogs.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-semibold mb-2">No Catalogs Available</h2>
          <p className="text-muted-foreground">Please check back later for official publications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {catalogs.map((cat) => {
            const ex = cat.exhibitions as any
            const exhibitionTitle = locale === 'bn' && ex.theme_bn ? ex.theme_bn : ex.theme_en
            const title = locale === 'bn' && cat.title_bn ? cat.title_bn : cat.title_en
            const description = locale === 'bn' && cat.description_bn ? cat.description_bn : cat.description_en

            return (
              <div key={cat.id} className="group relative bg-card rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                <div className="aspect-[3/4] relative bg-muted overflow-hidden">
                  {cat.cover_image_url ? (
                    <Image
                      src={cat.cover_image_url}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                      <BookOpen className="w-24 h-24" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {cat.year}
                    <span className="text-muted-foreground/50 mx-1">•</span>
                    <Globe className="w-3.5 h-3.5" />
                    {cat.language.toUpperCase()}
                  </div>
                  
                  <h3 className="text-xl font-bold font-serif mb-2 line-clamp-2">{title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{exhibitionTitle}</p>
                  
                  {description && (
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                      {description}
                    </p>
                  )}
                  
                  <div className="mt-auto pt-4 border-t flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      v{cat.version} • {cat.total_downloads || 0} downloads
                    </div>
                    <Button size="sm" className="gap-2" asChild>
                      <a href={cat.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4" />
                        Download PDF
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
