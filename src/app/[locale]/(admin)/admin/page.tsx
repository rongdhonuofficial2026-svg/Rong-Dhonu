import { createClient } from "@/lib/supabase/server"
import { Users, Image as ImageIcon, Paintbrush, AlertCircle, Clock, ChevronRight, Activity } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { LuxuryCard } from "@/components/admin/ui/LuxuryCard"
import { AnimatedMetricCard } from "@/components/admin/ui/AnimatedMetricCard"
import { GlassPanel } from "@/components/admin/ui/GlassPanel"
import { PremiumButton } from "@/components/admin/ui/PremiumButton"
import Image from "next/image"

export default async function AdminDashboardOverview({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  // Parallel data fetching
  const [
    { count: pendingArtworksCount },
    { count: totalArtworksCount },
    { count: totalArtistsCount },
    { count: activeExhibitionsCount },
    { data: recentAudits }
  ] = await Promise.all([
    supabase.from('artworks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('artworks').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member'),
    supabase.from('exhibitions').select('*', { count: 'exact', head: true }).in('status', ['active', 'upcoming']),
    supabase.from('audit_logs').select('*, profiles(full_name_en)').order('created_at', { ascending: false }).limit(6)
  ])

  return (
    <div className="space-y-12">
      
      {/* Immersive Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[400px] flex flex-col justify-end p-8 md:p-12 museum-shadow">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/admin_hero.png" 
            alt="Museum Hall" 
            fill 
            className="object-cover object-center image-reveal scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium tracking-widest uppercase">System Operational</span>
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4 leading-tight text-shadow-elegant">
            Welcome to the <br />
            <span className="text-gradient-gold">Exhibition Engine.</span>
          </h1>
          <p className="text-white/80 text-lg max-w-xl font-light">
            The administrative core of Rongdhono. Manage your prestigious digital galleries, curate masterpieces, and oversee your artistic community.
          </p>
        </div>
      </section>

      {/* Live Metrics Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold tracking-tight">Gallery Pulse</h2>
          <PremiumButton variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
            View Analytics
          </PremiumButton>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedMetricCard 
            title="Pending Curation" 
            value={pendingArtworksCount || 0} 
            icon={AlertCircle} 
            colorTheme="gold"
            trend={{ value: "Action Required", isPositive: false }}
          />
          <AnimatedMetricCard 
            title="Collection Size" 
            value={totalArtworksCount || 0} 
            icon={ImageIcon} 
            colorTheme="blue"
            trend={{ value: "+12 this week", isPositive: true }}
          />
          <AnimatedMetricCard 
            title="Active Artists" 
            value={totalArtistsCount || 0} 
            icon={Users} 
            colorTheme="emerald"
            trend={{ value: "+5 this week", isPositive: true }}
          />
          <AnimatedMetricCard 
            title="Live Exhibitions" 
            value={activeExhibitionsCount || 0} 
            icon={Paintbrush} 
            colorTheme="purple"
          />
        </div>
      </section>

      {/* Operations & Timeline */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          <LuxuryCard 
            title="Museum Activity" 
            description="Real-time log of curatorial and administrative operations."
            action={<Activity className="w-5 h-5 text-muted-foreground" />}
          >
            <div className="mt-6 space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent">
              {!recentAudits || recentAudits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 mb-4 rounded-full glass flex items-center justify-center">
                    <Clock className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground font-medium">The halls are quiet.</p>
                  <p className="text-sm text-muted-foreground/70">No recent activity recorded.</p>
                </div>
              ) : (
                recentAudits.map((log: any, index: number) => (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 glass">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    <GlassPanel intensity="light" className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 transition-all hover:bg-white/60 dark:hover:bg-black/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-foreground">
                          {log.profiles ? log.profiles.full_name_en : 'System'}
                        </span>
                        <time className="text-xs font-mono text-muted-foreground/80">{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{log.action} <span className="font-medium text-foreground">{log.entity_type}</span></p>
                    </GlassPanel>
                  </div>
                ))
              )}
            </div>
          </LuxuryCard>
        </div>

        {/* Action Center */}
        <div className="space-y-6">
          <LuxuryCard 
            title="Command Center" 
            description="Immediate curatorial actions."
            padding="sm"
          >
            <div className="space-y-3 mt-4">
              <PremiumButton className="w-full justify-between" variant="glass" asChild>
                <Link href="/admin/artworks">
                  Review Artworks
                  <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full text-xs font-bold">{pendingArtworksCount || 0} Pending</span>
                </Link>
              </PremiumButton>
              <PremiumButton className="w-full justify-start" variant="glass" leftIcon={<Paintbrush className="w-4 h-4"/>} asChild>
                <Link href="/admin/exhibitions">Manage Exhibitions</Link>
              </PremiumButton>
              <PremiumButton className="w-full justify-start" variant="glass" leftIcon={<Users className="w-4 h-4"/>} asChild>
                <Link href="/admin/committee">Committee Assignments</Link>
              </PremiumButton>
            </div>
          </LuxuryCard>
          
          {/* Daily Quote / Brand Element */}
          <GlassPanel intensity="heavy" className="p-6 relative overflow-hidden bg-accent/5 dark:bg-accent/5">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-accent/20 blur-3xl" />
            <p className="font-serif italic text-lg leading-relaxed text-foreground/90 relative z-10">
              "Art is not what you see, but what you make others see."
            </p>
            <p className="text-xs font-bold tracking-widest uppercase text-accent mt-4 relative z-10">— Edgar Degas</p>
          </GlassPanel>
        </div>

      </section>
    </div>
  )
}
