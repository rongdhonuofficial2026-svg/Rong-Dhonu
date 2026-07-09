'use client'

import * as React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function SearchOverlay() {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Open search">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="search-dialog-content sm:max-w-2xl bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
          <Input 
            placeholder="Search exhibitions, artists, and artworks..." 
            className="search-dialog-input border-0 bg-transparent shadow-none focus-visible:ring-0 text-lg px-0 h-12"
            autoFocus
          />
        </div>
        <div className="p-6 bg-muted/20 min-h-[300px]">
          {/* Default State */}
          <div className="text-center text-muted-foreground py-10">
            <Search className="h-10 w-10 mx-auto mb-4 opacity-20" />
            <p>Start typing to search across the platform.</p>
          </div>
          {/* Results will go here later */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
