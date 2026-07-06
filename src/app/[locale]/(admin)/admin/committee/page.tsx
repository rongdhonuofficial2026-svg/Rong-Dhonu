import { createClient } from "@/lib/supabase/server"
import { GripVertical, Plus, Edit, Trash, Shield, Users } from "lucide-react"
import Image from "next/image"
import { LuxuryCard } from "@/components/admin/ui/LuxuryCard"
import { PremiumButton } from "@/components/admin/ui/PremiumButton"
import { GlassPanel } from "@/components/admin/ui/GlassPanel"

export default async function CommitteeManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  // Fetch committee members with their profiles
  const { data: members, error } = await supabase
    .from('committee_members')
    .select('*, profiles(*), exhibitions(year, theme_en)')
    .order('created_at', { ascending: true })

  if (error) {
    return <div className="p-8 text-destructive">Error loading committee: {error.message}</div>
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Immersive Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-end p-8 md:p-12 museum-shadow">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/committee_hero.png" 
            alt="Committee Boardroom" 
            fill 
            className="object-cover object-center image-reveal scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/20 mb-6">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium tracking-widest uppercase">Administrative Council</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3 leading-tight text-shadow-elegant">
              The <span className="text-gradient-gold">Committee</span>
            </h1>
            <p className="text-white/80 text-lg font-light">
              Govern the institution. Manage the esteemed board members, assign critical roles, and oversee the curatorial council for every exhibition.
            </p>
          </div>
          <PremiumButton variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Appoint Member
          </PremiumButton>
        </div>
      </section>

      {/* Roster Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="font-serif text-2xl tracking-tight text-foreground">Council Roster</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
            <Users className="w-4 h-4" />
            <span>{members?.length || 0} Members</span>
          </div>
        </div>

        <GlassPanel intensity="medium" className="p-2 sm:p-6 rounded-2xl">
          <div className="space-y-3">
            {!members || members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 mb-4 rounded-full border border-white/10 glass flex items-center justify-center">
                  <Shield className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <h3 className="font-serif text-2xl mb-2 text-foreground">No council appointed</h3>
                <p className="text-muted-foreground max-w-md mx-auto">The committee is currently empty. Appoint members to oversee exhibitions and moderate submissions.</p>
              </div>
            ) : (
              members.map((member: any) => (
                <div key={member.id} className="relative flex items-center gap-4 p-4 border border-white/10 rounded-xl bg-black/20 hover:bg-black/40 transition-colors group overflow-hidden">
                  
                  {/* Drag Handle */}
                  <div className="cursor-grab text-muted-foreground/50 hover:text-white transition-colors p-2">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  {/* Member Avatar */}
                  <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white/10 bg-black/50">
                    {member.profiles?.avatar_url ? (
                      <Image src={member.profiles.avatar_url} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground/50 font-serif text-xl bg-gradient-to-br from-black to-accent/20">
                        {member.profiles?.full_name_en?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  
                  {/* Member Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="font-serif font-bold text-xl truncate text-foreground group-hover:text-accent transition-colors">
                      {member.profiles?.full_name_en}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground mt-1 uppercase tracking-widest">
                      <span className="font-medium text-accent">{member.role_en}</span>
                      <span className="opacity-50">&bull;</span>
                      <span>{member.exhibitions?.theme_en || `Exhibition ${member.exhibitions?.year}` || 'Global'}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 md:static md:opacity-100 bg-gradient-to-l from-black/80 via-black/80 to-transparent md:bg-none pl-8 md:pl-0 h-full md:h-auto items-center justify-end md:justify-center">
                    <PremiumButton variant="glass" size="icon" className="w-10 h-10 rounded-full">
                      <Edit className="w-4 h-4" />
                    </PremiumButton>
                    <PremiumButton variant="glass" size="icon" className="w-10 h-10 rounded-full border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500">
                      <Trash className="w-4 h-4" />
                    </PremiumButton>
                  </div>
                  
                  {/* Left accent line on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))
            )}
          </div>
        </GlassPanel>
      </section>
    </div>
  )
}
