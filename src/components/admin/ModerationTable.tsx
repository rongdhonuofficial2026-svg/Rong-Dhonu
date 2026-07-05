'use client'

import * as React from "react"
import { moderateArtwork } from "@/actions/admin/artworks"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Image from "next/image"
import { Loader2, Search, Check, X, MessageSquare, ZoomIn } from "lucide-react"
import { Input } from "@/components/ui/input"

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
     a.profiles?.first_name_en?.toLowerCase().includes(search.toLowerCase()))
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
        <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="changes_requested">Needs Changes</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title or artist..." 
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredArtworks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
            No artworks found in this category.
          </div>
        ) : (
          filteredArtworks.map(a => (
            <Card key={a.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 relative bg-muted cursor-pointer group" onClick={() => openModeration(a)}>
                {a.main_image_url ? (
                  <Image src={a.main_image_url} alt={a.title_en} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No Image</div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm"><ZoomIn className="w-4 h-4 mr-2"/> Review</Button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold line-clamp-1">{a.title_en}</h3>
                  <Badge variant="outline">{a.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Artist: {a.profiles?.first_name_en} {a.profiles?.last_name_en}
                </p>
                <Button className="w-full" variant="outline" onClick={() => openModeration(a)}>
                  Review Submission
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-950 text-slate-100 border-slate-800">
          {selectedArtwork && (
            <div className="flex flex-col md:flex-row max-h-[85vh]">
              {/* Image Pane (Zoomable logic would just be object-contain, in a real app could use a pan-zoom library) */}
              <div className="w-full md:w-3/5 bg-black relative min-h-[300px] flex items-center justify-center border-r border-slate-800">
                {selectedArtwork.main_image_url ? (
                  <Image 
                    src={selectedArtwork.main_image_url} 
                    alt="Artwork" 
                    fill 
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                ) : (
                  <p className="text-slate-500">No Image Provided</p>
                )}
              </div>
              
              {/* Details & Actions Pane */}
              <div className="w-full md:w-2/5 flex flex-col h-full max-h-[85vh]">
                <DialogHeader className="p-6 pb-2 border-b border-slate-800">
                  <DialogTitle className="text-2xl font-serif text-white">{selectedArtwork.title_en}</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    By {selectedArtwork.profiles?.first_name_en} {selectedArtwork.profiles?.last_name_en}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="p-6 flex-1 overflow-y-auto space-y-4 text-sm text-slate-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 block mb-1">Medium</span>
                      {selectedArtwork.medium_en || '-'}
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Dimensions</span>
                      {selectedArtwork.dimensions || '-'}
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Price</span>
                      {selectedArtwork.price ? `₹${selectedArtwork.price}` : 'Not for sale'}
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Category</span>
                      <span className="capitalize">{selectedArtwork.category || '-'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-slate-500 block mb-1">Description</span>
                    <p className="line-clamp-4">{selectedArtwork.description_en || 'No description provided.'}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800">
                    <label className="text-slate-500 block mb-2 font-medium">Internal Notes / Artist Feedback</label>
                    <Textarea 
                      placeholder="Add feedback explaining rejection or requested changes..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-slate-200 resize-none h-24 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-wrap gap-2 justify-end">
                  {selectedArtwork.status !== 'approved' && (
                    <Button 
                      onClick={() => handleAction('approved')} 
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} Approve
                    </Button>
                  )}
                  {selectedArtwork.status !== 'changes_requested' && (
                    <Button 
                      onClick={() => handleAction('changes_requested')} 
                      disabled={isSubmitting}
                      variant="outline"
                      className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10 flex-1"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />} Req. Changes
                    </Button>
                  )}
                  {selectedArtwork.status !== 'rejected' && (
                    <Button 
                      onClick={() => handleAction('rejected')} 
                      disabled={isSubmitting}
                      variant="outline"
                      className="border-red-500/50 text-red-500 hover:bg-red-500/10 flex-1"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 mr-2" />} Reject
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
