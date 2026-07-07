import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import { Link } from "@/lib/i18n/routing"
import { LuxuryCard } from "@/components/admin/ui/LuxuryCard"
import { ChevronRight, Filter, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react"

export default async function GlobalModerationDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  // Fetch exhibitions with artwork counts grouped by status
  const { data: exhibitions, error } = await supabase
    .from('exhibitions')
    .select(`
      id,
      theme_en,
      theme_bn,
      year,
      status,
      artworks (
        id,
        status
      )
    `)
    .not('status', 'eq', 'archived')
    .order('exhibition_start', { ascending: false })

  if (error) {
    return <div className="p-8 text-destructive">Error loading moderation dashboard: {error.message}</div>
  }

  // Calculate aggregates
  const exhibitionStats = exhibitions?.map(exhibition => {
    const total = exhibition.artworks.length
    const pending = exhibition.artworks.filter(a => a.status === 'pending').length
    const approved = exhibition.artworks.filter(a => a.status === 'approved').length
    const rejected = exhibition.artworks.filter(a => a.status === 'rejected').length
    const changes = exhibition.artworks.filter(a => a.status === 'changes_requested').length

    return {
      ...exhibition,
      stats: { total, pending, approved, rejected, changes }
    }
  }) || []

  return (
    <div className="space-y-12 pb-20">
      {/* Immersive Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-end p-8 md:p-12 museum-shadow">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/moderation_hero.png" 
            alt="Moderation Studio" 
            fill 
            className="object-cover object-center image-reveal scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-3xl text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium tracking-widest uppercase">Global Control</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight text-shadow-elegant">
            Exhibition <span className="text-gradient-gold">Moderation</span>
          </h1>
          <p className="text-white/80 text-lg font-light">
            Select an exhibition to examine, appraise, and moderate submitted masterpieces before they enter the public gallery.
          </p>
        </div>
      </section>

      {/* Exhibitions List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">Active Exhibitions</h2>
          <div className="flex gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Select to review</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exhibitionStats.map(exh => (
            <Link key={exh.id} href={`/admin/exhibitions/${exh.id}/moderation`}>
              <LuxuryCard className="group hover:border-accent/50 transition-all duration-300 cursor-pointer h-full flex flex-col relative overflow-hidden">
                {/* Status Indicator */}
                <div className="absolute top-0 right-0 p-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted border border-border">
                    {exh.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="font-serif text-2xl mb-1 group-hover:text-accent transition-colors">{locale === 'bn' ? exh.theme_bn : exh.theme_en}</h3>
                  <p className="text-muted-foreground font-mono text-sm">{exh.year}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pending</span>
                    </div>
                    <p className="text-2xl font-serif font-bold text-amber-500">{exh.stats.pending}</p>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Revisions</span>
                    </div>
                    <p className="text-2xl font-serif font-bold text-indigo-400">{exh.stats.changes}</p>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Approved</span>
                    </div>
                    <p className="text-2xl font-serif font-bold text-emerald-500">{exh.stats.approved}</p>
                  </div>

                  <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rejected</span>
                    </div>
                    <p className="text-2xl font-serif font-bold text-rose-500">{exh.stats.rejected}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center text-sm font-medium text-accent">
                  Enter Moderation Dashboard <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </LuxuryCard>
            </Link>
          ))}

          {exhibitionStats.length === 0 && (
            <div className="col-span-full py-20 text-center border rounded-2xl bg-muted/10 border-dashed">
              <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-serif text-2xl mb-2">No Active Exhibitions</h3>
              <p className="text-muted-foreground">Create an exhibition to start receiving and moderating artworks.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
