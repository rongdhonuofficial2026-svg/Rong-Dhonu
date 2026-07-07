'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export function ExhibitionAnalyticsCard({ exhibition }: { exhibition: any }) {
  if (exhibition.status === 'draft' || exhibition.status === 'upcoming') return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analytics
        </CardTitle>
        <CardDescription>
          Visitor and interaction statistics for this exhibition.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 border border-dashed rounded-lg">
          <BarChart3 className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-lg mb-2">Analytics Gathering</h3>
          <p className="text-muted-foreground max-w-sm">
            Detailed analytics will appear here as visitors interact with the exhibition page, gallery, and catalog.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
