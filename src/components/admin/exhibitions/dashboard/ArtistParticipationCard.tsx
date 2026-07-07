'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users } from "lucide-react"

export function ArtistParticipationCard({ exhibition, count }: { exhibition: any, count: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participating Artists
        </CardTitle>
        <CardDescription>
          Manage artists participating in this exhibition.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 border border-dashed rounded-lg">
            <Users className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-lg mb-2">No Artists Yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Link artists to this exhibition to showcase their profiles.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-muted/20 border rounded-lg flex items-center justify-between">
            <span className="font-medium">{count} Artists Participating</span>
            {/* View Artists link to be added later */}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
