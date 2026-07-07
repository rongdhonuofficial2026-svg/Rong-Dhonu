'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Copy, Archive, Loader2, MoreVertical, Edit, Star, StarOff, Trash2, RotateCcw } from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  duplicateExhibition, 
  archiveExhibition, 
  softDeleteExhibition, 
  restoreExhibition, 
  updateExhibitionFeatureStatus 
} from "@/actions/admin/exhibitions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Link } from "@/lib/i18n/routing"

export function ExhibitionActions({ exhibition, locale }: { exhibition: any, locale: string }) {
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const executeAction = async (actionFn: () => Promise<{success?: boolean, error?: string, data?: any}>, successMsg: string) => {
    setIsLoading(true)
    const res = await actionFn()
    if (res.error) {
      toast.error("Error", { description: res.error })
    } else {
      toast.success("Success", { description: successMsg })
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDuplicate = () => executeAction(() => duplicateExhibition(exhibition.id), "Exhibition duplicated successfully.")
  const handleArchive = () => {
    if (confirm("Are you sure you want to archive this exhibition?")) {
      executeAction(() => archiveExhibition(exhibition.id), "Exhibition archived.")
    }
  }
  const handleFeature = () => executeAction(() => updateExhibitionFeatureStatus(exhibition.id, !exhibition.is_featured), exhibition.is_featured ? "Exhibition un-featured." : "Exhibition featured on homepage.")
  const handleDelete = () => {
    if (confirm("Are you sure you want to move this exhibition to trash?")) {
      executeAction(() => softDeleteExhibition(exhibition.id), "Exhibition moved to trash.")
    }
  }
  const handleRestore = () => executeAction(() => restoreExhibition(exhibition.id), "Exhibition restored to draft.")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4 text-muted-foreground" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-[#1C1C1E] border-border/50 text-white">
        
        {!exhibition.is_deleted && (
          <>
            <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
              <Link href={`/admin/exhibitions/${exhibition.id}`} className="flex items-center gap-2">
                <Edit className="w-4 h-4" /> Edit Exhibition
              </Link>
            </DropdownMenuItem>
            
            {exhibition.status === 'upcoming' || exhibition.status === 'ongoing' ? (
              <DropdownMenuItem onClick={handleFeature} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                {exhibition.is_featured ? (
                  <><StarOff className="w-4 h-4 mr-2" /> Remove Feature</>
                ) : (
                  <><Star className="w-4 h-4 mr-2 text-yellow-500" /> Feature on Homepage</>
                )}
              </DropdownMenuItem>
            ) : null}

            <DropdownMenuItem onClick={handleDuplicate} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
              <Copy className="w-4 h-4 mr-2" /> Duplicate
            </DropdownMenuItem>

            {exhibition.status !== 'archived' && (
              <DropdownMenuItem onClick={handleArchive} className="cursor-pointer text-amber-500 focus:text-amber-400 hover:bg-white/10 focus:bg-white/10">
                <Archive className="w-4 h-4 mr-2" /> Archive
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-rose-500 focus:text-rose-400 hover:bg-white/10 focus:bg-white/10">
              <Trash2 className="w-4 h-4 mr-2" /> Move to Trash
            </DropdownMenuItem>
          </>
        )}

        {exhibition.is_deleted && (
          <>
            <DropdownMenuItem onClick={handleRestore} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
              <RotateCcw className="w-4 h-4 mr-2" /> Restore
            </DropdownMenuItem>
          </>
        )}

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
