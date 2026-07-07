import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Link } from '@/lib/i18n/routing'
import { Calendar, Globe, FileText, ArrowDownToLine, ChevronLeft, Info, Eye } from 'lucide-react'
import { CatalogDownloadButton } from '@/components/public/catalogs/CatalogDownloadButton'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: catalog } = await supabase
    .from('catalogs')
    .select('*, exhibitions(theme_en, hero_image_url)')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (!catalog) {
    return { title: 'Catalog Not Found' }
  }

  const title = catalog.title_en || 'Catalog'
  const description = catalog.description_en || 'Official Exhibition Catalog'
  const image = (catalog.exhibitions as any)?.hero_image_url || '/images/catalogs_hero.png'

  return {
    title: `${title} | Rongdhono Art Gallery`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [image]
    }
  }
}

export default async function CatalogDetailPage({ params }: Props) {
  const { locale, id } = await params
  const supabase = await createClient()

  const { data: catalog, error } = await supabase
    .from('catalogs')
    .select('*, exhibitions(*)')
    .eq('id', id)
    .eq('status', 'published') // CRITICAL: Only allow published catalogs
    .single()

  if (error || !catalog) {
    notFound()
  }

  const ex = catalog.exhibitions as any
  const exhibitionTitle = locale === 'bn' && ex.theme_bn ? ex.theme_bn : ex.theme_en
  const title = locale === 'bn' && catalog.title_bn ? catalog.title_bn : catalog.title_en
  const description = locale === 'bn' && catalog.description_bn ? catalog.description_bn : catalog.description_en
  const coverImage = ex.hero_image_url || '/images/catalogs_hero.png'

  // Format date
  const publishedDate = new Date(catalog.published_at || catalog.created_at).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-background pb-24 pt-24 md:pt-32">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Back Navigation */}
        <Link 
          href="/catalogs" 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to Archive
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Cover Image & Actions */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border bg-muted mb-8 group">
              <Image
                src={coverImage}
                alt={title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/5" />
              
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border backdrop-blur-md bg-black/40 text-white border-white/20 shadow-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> PDF
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href={catalog.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 h-14 text-base font-semibold rounded-xl border-2 bg-background hover:bg-muted transition-colors shadow-sm"
              >
                <Eye className="w-5 h-5" /> Preview PDF
              </Link>
              
              <div className="flex-1">
                {/* Re-use the existing download button but make it full width and tall */}
                <CatalogDownloadButton catalog={catalog} className="w-full h-14 text-base font-semibold rounded-xl shadow-md" />
              </div>
            </div>
          </div>

          {/* Right Column: Metadata */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary mb-4 tracking-wider uppercase">
              <Calendar className="w-4 h-4" />
              {ex.year} Exhibition
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight mb-4">
              {title}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground font-light mb-8">
              Official Catalog for <span className="text-foreground font-medium">{exhibitionTitle}</span>
            </p>

            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              {description ? (
                <p className="leading-relaxed text-muted-foreground/90">
                  {description}
                </p>
              ) : (
                <p className="italic text-muted-foreground/70">
                  No description provided for this catalog.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-border/50">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Language</span>
                <span className="text-base font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" /> {catalog.language.toUpperCase()}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Version</span>
                <span className="text-base font-semibold">v{catalog.version}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">File Size</span>
                <span className="text-base font-semibold">{catalog.file_size ? `${(catalog.file_size / 1024 / 1024).toFixed(1)} MB` : 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Downloads</span>
                <span className="text-base font-semibold flex items-center gap-2"><ArrowDownToLine className="w-4 h-4 text-muted-foreground" /> {catalog.total_downloads || 0}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4" /> Published on {publishedDate}
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Link 
                  href={`/exhibitions/${ex.id}`}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
                >
                  View Related Exhibition
                </Link>
                
                <Link 
                  href={`/gallery?exhibition=${ex.id}`}
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-lg border bg-background hover:bg-muted transition-colors"
                >
                  View Gallery Album
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
