'use client'

import * as React from "react"
import { moderateArtwork } from "@/actions/admin/artworks"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Image from "next/image"
import { Loader2, Search, Check, X, MessageSquare, ZoomIn, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { LuxuryCard } from "@/components/admin/ui/LuxuryCard"
import { PremiumButton } from "@/components/admin/ui/PremiumButton"
import { GlassPanel } from "@/components/admin/ui/GlassPanel"

export function ModerationTable({ artworks, locale }: { artworks: any[], locale: string }) {
  const [filter, setFilter] = React.useState('pending')
  const [search, setSearch] = React.useState('')
  const [selectedArtwork, setSelectedArtwork] = React.useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [feedback, setFeedback] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const filteredArtworks = artworks.filter(a => 
    a.status === filter && 
    (a.title_en?.toLowerCase().includes(search.toLowerCase()) || 
     a.profiles?.full_name_en?.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAction = async (status: 'approved' | 'rejected' | 'changes_requested') => {
    if (!selectedArtwork) return
    if ((status === 'rejected' || status === 'changes_requested') && !feedback) {
      toast.error("Feedback Required", { description: "Please provide feedback for the artist." })
      return
    }

    setIsSubmitting(true)
    const res = await moderateArtwork(selectedArtwork.id, status, feedback)
    if (res.error) {
      toast.error("Error", { description: res.error })
    } else {
      toast.success("Success", { description: `Artwork ${status.replace('_', ' ')} successfully.` })
      setIsDialogOpen(false)
      setSelectedArtwork(null)
      setFeedback('')
    }
    setIsSubmitting(false)
  }

  const openModeration = (artwork: any) => {
    setSelectedArtwork(artwork)
    setFeedback('')
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-8">
      {/* Filters and Search Bar */}
      <GlassPanel intensity="medium" className="p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 items-center">
        <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
          <TabsList className="bg-black/20 border border-white/10 p-1 rounded-xl h-auto">
            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-accent text-muted-foreground py-2 px-4">Awaiting Review</TabsTrigger>
            <TabsTrigger value="changes_requested" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-amber-400 text-muted-foreground py-2 px-4">Revisions</TabsTrigger>
            <TabsTrigger value="approved" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-emerald-400 text-muted-foreground py-2 px-4">Approved</TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-rose-400 text-muted-foreground py-2 px-4">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title or artist..." 
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
            <h3 className="font-serif text-2xl mb-2">No artworks found.</h3>
            <p className="text-muted-foreground">There are no submissions currently in this category.</p>
          </div>
        ) : (
          filteredArtworks.map(a => (
            <LuxuryCard key={a.id} padding="none" className="overflow-hidden group cursor-pointer" onClick={() => openModeration(a)}>
              {/* Artwork Image Area */}
              <div className="aspect-square relative bg-muted overflow-hidden">
                {a.main_image_url ? (
                  <Image src={a.main_image_url} alt={a.title_en} fill className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:blur-[2px]" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-md mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-medium tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                    Examine Artwork
                  </span>
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border backdrop-blur-md bg-black/40 text-white border-white/20">
                    {a.category}
                  </span>
                </div>
              </div>
              
              {/* Info Area */}
              <div className="p-5">
                <p className="text-xs font-mono text-accent tracking-widest uppercase mb-1 line-clamp-1">
                  By {a.profiles?.full_name_en}
                </p>
                <h3 className="font-serif text-xl leading-tight text-foreground">{a.title_en}</h3>
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
              {/* Left Side: Immersive Image Viewer */}
              <div className="w-full md:w-[65%] h-[40vh] md:h-full bg-black relative flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-10 pointer-events-none" />
                {selectedArtwork.main_image_url ? (
                  <Image 
                    src={selectedArtwork.main_image_url} 
                    alt="Artwork" 
                    fill 
                    className="object-contain p-4 md:p-12 z-0"
                    sizes="(max-width: 768px) 100vw, 65vw"
                    priority
                  />
                ) : (
                  <p className="text-muted-foreground z-0">No Image Provided</p>
                )}
              </div>
              
              {/* Right Side: Appraisal Panel */}
              <div className="w-full md:w-[35%] flex flex-col h-[55vh] md:h-full bg-gradient-to-b from-[#0A0A0A] to-[#111]">
                <div className="p-6 md:p-8 border-b border-white/10 bg-black/20 relative z-20">
                  <div className="text-xs font-mono text-accent tracking-widest uppercase mb-2">
                    Artwork Dossier
                  </div>
                  <DialogTitle className="text-3xl md:text-4xl font-serif text-white leading-tight mb-2">
                    {selectedArtwork.title_en}
                  </DialogTitle>
                  <DialogDescription className="text-lg text-white/70">
                    By {selectedArtwork.profiles?.full_name_en}
                  </DialogDescription>
                </div>
                
                <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8 text-white/80 scrollbar-thin scrollbar-thumb-white/10">
                  
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1">Medium</span>
                      <span className="font-medium text-white">{selectedArtwork.medium_en || 'Unspecified'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1">Dimensions</span>
                      <span className="font-medium text-white">{selectedArtwork.dimensions || 'Unspecified'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1">Price</span>
                      <span className="font-medium text-white">{selectedArtwork.price ? `₹${selectedArtwork.price}` : 'Not for sale'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1">Category</span>
                      <span className="font-medium text-white capitalize">{selectedArtwork.category || 'Unspecified'}</span>
                    </div>
                  </div>
                  
                  <div className="h-px bg-white/10 w-full" />
                  
                  {/* Description */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-3">Artist's Statement</span>
                    <p className="leading-relaxed text-sm text-white/70">
                      {selectedArtwork.description_en || 'No description provided by the artist.'}
                    </p>
                  </div>

                  {/* Feedback Form */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-3">
                      Curatorial Feedback / Internal Notes
                    </label>
                    <Textarea 
                      placeholder="Add specific feedback for the artist regarding rejection or requested changes..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="bg-black/50 border-white/10 text-white resize-none h-28 focus-visible:ring-accent rounded-lg placeholder:text-white/20 text-sm"
                    />
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-6 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row gap-3 relative z-20">
                  {selectedArtwork.status !== 'approved' && (
                    <PremiumButton 
                      onClick={() => handleAction('approved')} 
                      disabled={isSubmitting}
                      className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 sm:flex-1 h-12"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 mr-2" />} 
                      Approve Masterpiece
                    </PremiumButton>
                  )}
                  {selectedArtwork.status !== 'changes_requested' && (
                    <PremiumButton 
                      onClick={() => handleAction('changes_requested')} 
                      disabled={isSubmitting}
                      variant="glass"
                      className="text-amber-500 hover:bg-amber-500 hover:text-white hover:border-amber-500 sm:flex-1 h-12"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5 mr-2" />} 
                      Request Revisions
                    </PremiumButton>
                  )}
                  {selectedArtwork.status !== 'rejected' && (
                    <PremiumButton 
                      onClick={() => handleAction('rejected')} 
                      disabled={isSubmitting}
                      variant="glass"
                      className="text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 sm:flex-1 h-12"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5 mr-2" />} 
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
