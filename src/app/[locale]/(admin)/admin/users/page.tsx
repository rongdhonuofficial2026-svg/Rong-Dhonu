import { createClient } from "@/lib/supabase/server"
import { Search, Shield, Calendar, Image as ImageIcon, Users as UsersIcon, Mail, MoreVertical } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { LuxuryCard } from "@/components/admin/ui/LuxuryCard"
import { PremiumButton } from "@/components/admin/ui/PremiumButton"
import { GlassPanel } from "@/components/admin/ui/GlassPanel"

export default async function UserManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      *,
      artworks(id)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-destructive">Error loading users: {error.message}</div>
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Immersive Hero Section */}
      <section className="relative rounded-3xl overflow-hidden min-h-[300px] flex flex-col justify-end p-8 md:p-12 museum-shadow">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/users_hero.png" 
            alt="Users and Artists" 
            fill 
            className="object-cover object-center image-reveal scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="max-w-3xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/20 mb-6">
              <UsersIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium tracking-widest uppercase">Network & Personnel</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight text-shadow-elegant">
              User <span className="text-gradient-gold">Directory</span>
            </h1>
            <p className="text-white/80 text-lg font-light">
              Oversee the creative network. Manage access for artists, committee members, and system administrators.
            </p>
          </div>
          
          <div className="w-full sm:w-auto">
            <PremiumButton variant="primary">
              Invite User
            </PremiumButton>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="space-y-8">
        <GlassPanel intensity="medium" className="p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div className="relative w-full sm:flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search directory by name or email..." 
              className="pl-11 bg-black/20 border-white/10 focus-visible:ring-accent rounded-xl h-11 text-foreground placeholder:text-muted-foreground/70"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm whitespace-nowrap hover:bg-white/20 transition-colors">All Users</button>
            <button className="px-4 py-2 rounded-lg bg-black/40 text-muted-foreground text-sm whitespace-nowrap hover:bg-white/10 hover:text-white transition-colors border border-white/5">Artists</button>
            <button className="px-4 py-2 rounded-lg bg-black/40 text-muted-foreground text-sm whitespace-nowrap hover:bg-white/10 hover:text-white transition-colors border border-white/5">Committee</button>
            <button className="px-4 py-2 rounded-lg bg-black/40 text-muted-foreground text-sm whitespace-nowrap hover:bg-white/10 hover:text-white transition-colors border border-white/5">Admins</button>
          </div>
        </GlassPanel>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {!users || users.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 rounded-full border border-white/10 glass flex items-center justify-center mb-6 mx-auto">
                <UsersIcon className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="font-serif text-2xl mb-2">No users found</h3>
              <p className="text-muted-foreground">The directory is currently empty.</p>
            </div>
          ) : (
            users.map((user: any) => (
              <LuxuryCard key={user.id} padding="none" className="overflow-hidden group">
                <div className="p-6 relative z-10">
                  {/* Role Badge */}
                  <div className="absolute top-6 right-6">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md text-white ${
                      user.role === 'admin' || user.role === 'owner' 
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' 
                        : user.role === 'committee' 
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                          : 'bg-white/5 border-white/10 text-white/70'
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-white/10 bg-black/50 group-hover:border-accent/50 transition-colors duration-500">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt="Avatar" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground/50 font-serif text-2xl bg-gradient-to-br from-black to-accent/10">
                          {user.full_name_en?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-serif font-bold text-xl text-foreground truncate flex items-center gap-2 group-hover:text-gradient-gold transition-all duration-500">
                        {user.full_name_en}
                        {(user.role === 'admin' || user.role === 'owner') && <Shield className="w-4 h-4 text-indigo-400" />}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground/70 mt-1 truncate">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{user.email || 'No email provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats & Meta */}
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-6 text-sm text-muted-foreground/80">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1 flex items-center gap-1.5"><ImageIcon className="w-3 h-3"/> Artworks</span>
                        <span className="font-medium text-foreground">{user.artworks?.length || 0}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Joined</span>
                        <span className="font-medium text-foreground">{new Date(user.created_at).getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Actions Footer */}
                <div className="bg-black/40 border-t border-white/5 p-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <PremiumButton variant="glass" className="flex-1 h-10 text-xs">
                    View Profile
                  </PremiumButton>
                  <PremiumButton variant="glass" className="w-10 h-10 px-0 flex items-center justify-center">
                    <MoreVertical className="w-4 h-4" />
                  </PremiumButton>
                </div>
              </LuxuryCard>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
