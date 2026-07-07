'use client'

import * as React from "react"
import { moderateArtwork } from "@/actions/admin/artworks"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Search, Check, X, MessageSquare, ZoomIn, Info, User, Calendar, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { LuxuryCard } from "@/components/admin/ui/LuxuryCard"
import { PremiumButton } from "@/components/admin/ui/PremiumButton"
import { GlassPanel } from "@/components/admin/ui/GlassPanel"

interface ArtworkProfile {
  id?: string
  full_name_en?: string
  full_name_bn?: string
  phone?: string
  avatar_url?: string
  instagram_url?: string
  website_url?: string
}

interface Artwork {
  id: string
  title_en: string
  title_bn?: string | null
  medium_en?: string | null
  medium_bn?: string | null
  dimensions?: string | null
  category?: string | null
  theme?: string | null
  description_en?: string | null
  price?: number | null
  status: string
  notes?: string | null
  main_image_url?: string | null
  created_at?: string
  // Supabase foreign-table join can return [] or a single object depending on cardinality
  profiles?: ArtworkProfile | ArtworkProfile[] | null
}

// Helper to always get a single profile from the Supabase join result
function getProfile(profiles: ArtworkProfile | ArtworkProfile[] | null | undefined): ArtworkProfile | null {
  if (!profiles) return null
  if (Array.isArray(profiles)) return profiles[0] ?? null
  return profiles
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    changes_requested: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  }
  const labels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    changes_requested: 'Revision Requested',
  }
  return (
    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${styles[status] ?? 'bg-muted text-muted-foreground border-border'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function ArtistAvatar({ url, name, size = 40 }: { url?: string | null; name?: string | null; size?: number }) {
  return (
    <div
      className="rounded-full border-2 border-white/20 overflow-hidden bg-white/5 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name ?? 'Artist'} className="w-full h-full object-cover" />
      ) : (
        <User className="text-white/40" style={{ width: size * 0.45, height: size * 0.45 }} />
      )}
    </div>
  )
}

export function ModerationTable({ artworks, locale }: { artworks: Artwork[]; locale: string }) {
  const [filter, setFilter] = React.useState('pending')
  const [search, setSearch] = React.useState('')
  const [selectedArtwork, setSelectedArtwork] = React.useState<Artwork | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [feedback, setFeedback] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const counts = React.useMemo(() => ({
    pending: artworks.filter(a => a.status === 'pending').length,
    changes_requested: artworks.filter(a => a.status === 'changes_requested').length,
    approved: artworks.filter(a => a.status === 'approved').length,
    rejected: artworks.filter(a => a.status === 'rejected').length,
  }), [artworks])

  const filteredArtworks = artworks.filter(a => {
    const p = getProfile(a.profiles)
    return (
      a.status === filter &&
      (a.title_en?.toLowerCase().includes(search.toLowerCase()) ||
        p?.full_name_en?.toLowerCase().includes(search.toLowerCase()))
    )
  })

  const handleAction = async (status: 'approved' | 'rejected' | 'changes_requested') => {
    if (!selectedArtwork) return
    if ((status === 'rejected' || status === 'changes_requested') && !feedback.trim()) {
      toast.error("Feedback Required", { description: "Please provide feedback for the artist before rejecting or requesting revisions." })
      return
    }

    setIsSubmitting(true)
    const res = await moderateArtwork(selectedArtwork.id, status, feedback)
    if (res.error) {
      toast.error("Action Failed", { description: res.error })
    } else {
      toast.success("Decision Recorded", {
        description: `Artwork has been ${status === 'changes_requested' ? 'sent back for revision' : status}.`
      })
      setIsDialogOpen(false)
      setSelectedArtwork(null)
      setFeedback('')
    }
    setIsSubmitting(false)
  }

  const openModeration = (artwork: Artwork) => {
    setSelectedArtwork(artwork)
    setFeedback(artwork.notes ?? '')
    setIsDialogOpen(true)
  }

  const formatDate = (iso?: string) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-8">
      {/* Filters and Search Bar */}
      <GlassPanel intensity="medium" className="p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 items-center">
        <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
          <TabsList className="bg-black/20 border border-white/10 p-1 rounded-xl h-auto flex-wrap gap-1">
            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-amber-400 text-muted-foreground py-2 px-4">
              Pending <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20">{counts.pending}</span>
            </TabsTrigger>
            <TabsTrigger value="changes_requested" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-blue-400 text-muted-foreground py-2 px-4">
              Revisions <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-blue-500/20">{counts.changes_requested}</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-emerald-400 text-muted-foreground py-2 px-4">
              Approved <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-emerald-500/20">{counts.approved}</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-rose-400 text-muted-foreground py-2 px-4">
              Rejected <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-rose-500/20">{counts.rejected}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or artist name..."
            className="pl-11 bg-black/20 border-white/10 focus-visible:ring-accent rounded-xl h-11 text-foreground placeholder:text-muted-foreground/70"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </GlassPanel>

      {/* Artworks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filteredArtworks.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 rounded-full border border-white/10 glass flex items-center justify-center mb-6 mx-auto">
              <Info className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="font-serif text-2xl mb-2">No submissions found.</h3>
            <p className="text-muted-foreground">There are no artworks in this category for this exhibition yet.</p>
          </div>
        ) : (
          filteredArtworks.map(a => (
            <LuxuryCard key={a.id} padding="none" className="overflow-hidden group cursor-pointer" onClick={() => openModeration(a)}>
              {/* Artwork Image */}
              <div className="aspect-square relative bg-muted overflow-hidden">
                {a.main_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.main_image_url}
                    alt={a.title_en}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:blur-[2px]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Info className="w-8 h-8 opacity-30" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-md mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-medium tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                    Open Appraisal
                  </span>
                </div>

                {/* Status badge */}
                <div className="absolute top-3 left-3 z-10">
                  <StatusBadge status={a.status} />
                </div>

                {/* Category */}
                {a.category && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-full border backdrop-blur-md bg-black/40 text-white border-white/20">
                      {a.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Info — Artist + Title */}
              <div className="p-4 flex items-center gap-3">
                {(() => {
                  const p = getProfile(a.profiles)
                  return (
                    <>
                      <ArtistAvatar url={p?.avatar_url} name={p?.full_name_en} size={40} />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{p?.full_name_en ?? 'Unknown Artist'}</p>
                        <h3 className="font-semibold text-sm leading-tight truncate">{a.title_en}</h3>
                        <p className="text-xs text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {formatDate(a.created_at)}
                        </p>
                      </div>
                    </>
                  )
                })()}
              </div>
            </LuxuryCard>
          ))
        )}
      </div>

      {/* Full Screen Moderation Appraisal Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 overflow-hidden bg-[#0A0A0A] border border-white/10 rounded-2xl flex flex-col md:flex-row shadow-2xl">
          {selectedArtwork && (
            <>
              {/* Left: Image Viewer */}
              <div className="w-full md:w-[60%] h-[40vh] md:h-full bg-black relative flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-10 pointer-events-none" />
                {selectedArtwork.main_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedArtwork.main_image_url}
                    alt={selectedArtwork.title_en}
                    className="w-full h-full object-contain p-4 md:p-12 z-0 relative"
                  />
                ) : (
                  <p className="text-muted-foreground z-0">No Image Provided</p>
                )}
              </div>

              {/* Right: Appraisal Panel */}
              <div className="w-full md:w-[40%] flex flex-col h-[55vh] md:h-full bg-gradient-to-b from-[#0A0A0A] to-[#111]">

                {/* Artist Header */}
                <div className="p-6 md:p-8 border-b border-white/10 bg-black/20">
                  {(() => {
                    const p = getProfile(selectedArtwork.profiles)
                    return (
                      <div className="flex items-center gap-4 mb-4">
                        <ArtistAvatar url={p?.avatar_url} name={p?.full_name_en} size={56} />
                        <div>
                          <p className="text-xs font-mono text-accent tracking-widest uppercase mb-1">Artist</p>
                          <p className="font-semibold text-white text-lg leading-tight">{p?.full_name_en ?? '—'}</p>
                          {p?.full_name_bn && (
                            <p className="text-white/50 text-sm">{p.full_name_bn}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            {p?.instagram_url && (
                              <a href={p.instagram_url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-accent text-xs flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> Instagram
                              </a>
                            )}
                            {p?.website_url && (
                              <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-accent text-xs flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> Portfolio
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  <div className="text-xs font-mono text-accent tracking-widest uppercase mb-2">Artwork</div>
                  <DialogTitle className="text-2xl md:text-3xl font-serif text-white leading-tight mb-1">
                    {selectedArtwork.title_en}
                  </DialogTitle>
                  {selectedArtwork.title_bn && (
                    <p className="text-white/50 text-sm mb-2">{selectedArtwork.title_bn}</p>
                  )}
                  <DialogDescription asChild>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedArtwork.status} />
                      <span className="text-white/40 text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Submitted {formatDate(selectedArtwork.created_at)}
                      </span>
                    </div>
                  </DialogDescription>
                </div>

                {/* Metadata + Feedback */}
                <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6 text-white/80 scrollbar-thin scrollbar-thumb-white/10">

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {[
                      { label: 'Medium', value: selectedArtwork.medium_en || 'Not specified' },
                      { label: 'Dimensions', value: selectedArtwork.dimensions || 'Not specified' },
                      { label: 'Category', value: selectedArtwork.category || 'Not specified' },
                      { label: 'Theme', value: selectedArtwork.theme || 'Not specified' },
                      { label: 'Price', value: selectedArtwork.price ? `₹${selectedArtwork.price}` : 'Not for sale' },
                      { label: 'Phone', value: getProfile(selectedArtwork.profiles)?.phone || '—' },
                    ].map(item => (
                      <div key={item.label}>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1">{item.label}</span>
                        <span className="font-medium text-white text-sm capitalize">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-white/10 w-full" />

                  {/* Artist Statement */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-3">Artist Statement</span>
                    <p className="leading-relaxed text-sm text-white/70">
                      {selectedArtwork.description_en || 'No description provided by the artist.'}
                    </p>
                  </div>

                  {/* Previous Moderator Notes (if any) */}
                  {selectedArtwork.notes && (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-2">Previous Feedback</span>
                      <p className="text-sm text-amber-200/80 leading-relaxed">{selectedArtwork.notes}</p>
                    </div>
                  )}

                  {/* Feedback / Notes */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-3">
                      Curatorial Feedback <span className="text-rose-400/80 normal-case font-normal">(required for rejection / revision)</span>
                    </label>
                    <Textarea
                      placeholder="Add specific feedback for the artist regarding this decision..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="bg-black/50 border-white/10 text-white resize-none h-28 focus-visible:ring-accent rounded-lg placeholder:text-white/20 text-sm"
                    />
                  </div>
                </div>

                {/* Decision Footer */}
                <div className="p-5 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row gap-3">
                  {selectedArtwork.status !== 'approved' && (
                    <PremiumButton
                      onClick={() => handleAction('approved')}
                      disabled={isSubmitting}
                      className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 sm:flex-1 h-11"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                      Approve
                    </PremiumButton>
                  )}
                  {selectedArtwork.status !== 'changes_requested' && (
                    <PremiumButton
                      onClick={() => handleAction('changes_requested')}
                      disabled={isSubmitting}
                      variant="glass"
                      className="text-amber-500 hover:bg-amber-500 hover:text-white hover:border-amber-500 sm:flex-1 h-11"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-1.5" />}
                      Request Revision
                    </PremiumButton>
                  )}
                  {selectedArtwork.status !== 'rejected' && (
                    <PremiumButton
                      onClick={() => handleAction('rejected')}
                      disabled={isSubmitting}
                      variant="glass"
                      className="text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 sm:flex-1 h-11"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 mr-1.5" />}
                      Reject
                    </PremiumButton>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
