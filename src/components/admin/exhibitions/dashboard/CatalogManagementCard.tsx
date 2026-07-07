'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CatalogForm } from "@/components/admin/catalogs/CatalogForm"
import { Lock } from "lucide-react"

export function CatalogManagementCard({ exhibition, catalog }: { exhibition: any, catalog: any }) {
  const isLocked = exhibition.status === 'draft' || exhibition.status === 'upcoming'

  return (
    <Card className={isLocked ? "bg-muted/50 border-dashed" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Official Catalog
          {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          {isLocked 
            ? "Catalog uploads are locked until the exhibition is 'ongoing' or 'archived'." 
            : "Manage the official digital catalog PDF for this exhibition."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLocked ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">Catalog Locked</h3>
            <p className="text-muted-foreground max-w-sm">
              The exhibition has not started yet. You can upload the catalog once the status changes to Ongoing.
            </p>
          </div>
        ) : (
          <CatalogForm 
            exhibitions={[exhibition]} 
            initialData={catalog || { exhibition_id: exhibition.id }} 
          />
        )}
      </CardContent>
    </Card>
  )
}
