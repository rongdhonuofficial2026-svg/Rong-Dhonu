'use client'

import { CheckCircle2, Circle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ChecklistProps {
  exhibition: any
  artworksCount: number
  artistsCount: number
  galleryCount: number
  hasCatalog: boolean
}

export function ExhibitionCompletionChecklist({ exhibition, artworksCount, artistsCount, galleryCount, hasCatalog }: ChecklistProps) {
  
  const items = [
    { label: "Basic Information", completed: !!(exhibition.theme_en && exhibition.exhibition_start) },
    { label: "Hero Banner", completed: !!exhibition.hero_image_url },
    { label: "Homepage Promotion", completed: !!exhibition.is_featured },
    { label: "Artist Participation", completed: artistsCount > 0 },
    { label: "Artwork Submission", completed: artworksCount > 0 },
    { label: "Gallery Album", completed: galleryCount > 0 },
    { label: "Official Catalog", completed: hasCatalog }
  ]

  const completedCount = items.filter(i => i.completed).length
  const progress = Math.round((completedCount / items.length) * 100)

  return (
    <Card className="bg-card shadow-sm border-border">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg">Setup Checklist</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">{completedCount} of {items.length} completed</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-4">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border/40">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors">
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
              <span className={cn("text-sm font-medium", item.completed ? "text-foreground" : "text-muted-foreground")}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
