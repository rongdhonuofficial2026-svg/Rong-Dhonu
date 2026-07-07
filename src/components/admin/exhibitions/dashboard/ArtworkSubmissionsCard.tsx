'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Palette } from "lucide-react"

export function ArtworkSubmissionsCard({ exhibition, count }: { exhibition: any, count: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Artwork Submissions
        </CardTitle>
        <CardDescription>
          Artworks submitted for this exhibition.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 border border-dashed rounded-lg">
            <Palette className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-lg mb-2">No Artworks Yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Artworks submitted to this exhibition will appear here.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-muted/20 border rounded-lg flex items-center justify-between">
            <span className="font-medium">{count} Artworks Submitted</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
