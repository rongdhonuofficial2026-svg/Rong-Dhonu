'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Copy, Archive, Loader2, MoreVertical, Edit, Star, StarOff, Trash2, RotateCcw, AlertTriangle } from "lucide-react"
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
  permanentDeleteExhibition,
  updateExhibitionFeatureStatus 
} from "@/actions/admin/exhibitions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Link } from "@/lib/i18n/routing"
import { ConfirmationDialog } from "@/components/admin/ui/ConfirmationDialog"

export function ExhibitionActions({ exhibition, locale }: { exhibition: any, locale: string }) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [confirmAction, setConfirmAction] = React.useState<'none' | 'archive' | 'delete' | 'permanent_delete'>('none')
  const router = useRouter()

  const executeAction = async (
    actionFn: () => Promise<{success?: boolean, error?: string, data?: any}>, 
    successMsg: string
  ) => {
    setIsLoading(true)
    try {
      const res = await actionFn()
      if (res.error) {
        toast.error("Action Failed", { description: res.error })
      } else {
        toast.success("Success", { description: successMsg })
        router.refresh()
      }
    } catch (err: any) {
      toast.error("Unexpected Error", { description: err.message || "An unexpected error occurred." })
    } finally {
      setIsLoading(false)
      setConfirmAction('none')
    }
  }

  const handleDuplicate = () => executeAction(() => duplicateExhibition(exhibition.id), "Exhibition duplicated successfully.")
  const handleFeature = () => executeAction(() => updateExhibitionFeatureStatus(exhibition.id, !exhibition.is_featured), exhibition.is_featured ? "Exhibition un-featured." : "Exhibition featured on homepage.")
  const handleRestore = () => executeAction(() => restoreExhibition(exhibition.id), "Exhibition restored to draft.")

  const handleConfirmAction = () => {
    if (confirmAction === 'archive') {
      executeAction(() => archiveExhibition(exhibition.id), "Exhibition archived.")
    } else if (confirmAction === 'delete') {
      executeAction(() => softDeleteExhibition(exhibition.id), "Exhibition moved to trash.")
    } else if (confirmAction === 'permanent_delete') {
      executeAction(() => permanentDeleteExhibition(exhibition.id), "Exhibition permanently deleted.")
    }
  }

  // Dialog configurations
  const getDialogConfig = () => {
    switch (confirmAction) {
      case 'archive':
        return {
          title: "Archive Exhibition",
          description: "Are you sure you want to archive this exhibition? This will shift it into a read-only phase for public visitors.",
          confirmText: "Archive",
          isDestructive: false
        }
      case 'delete':
        return {
          title: "Move to Trash",
          description: "Are you sure you want to move this exhibition to the trash? It can be restored later, but it will be hidden from active lists.",
          confirmText: "Move to Trash",
          isDestructive: true
        }
      case 'permanent_delete':
        return {
          title: "Permanently Delete Exhibition",
          description: "This action is irreversible. The exhibition record will be permanently deleted from the database. This check will fail if there are linked artworks, gallery media, or catalogs.",
          confirmText: "Delete Permanently",
          isDestructive: true
        }
      default:
        return {
          title: "",
          description: "",
          confirmText: "",
          isDestructive: false
        }
    }
  }

  const dialogConfig = getDialogConfig()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4 text-muted-foreground" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 bg-[#1C1C1E] border-border/50 text-white">
          
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
                <DropdownMenuItem onClick={() => setConfirmAction('archive')} className="cursor-pointer text-amber-500 focus:text-amber-400 hover:bg-white/10 focus:bg-white/10">
                  <Archive className="w-4 h-4 mr-2" /> Archive
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem onClick={() => setConfirmAction('delete')} className="cursor-pointer text-rose-500 focus:text-rose-400 hover:bg-white/10 focus:bg-white/10">
                <Trash2 className="w-4 h-4 mr-2" /> Move to Trash
              </DropdownMenuItem>
            </>
          )}

          {exhibition.is_deleted && (
            <>
              <DropdownMenuItem onClick={handleRestore} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                <RotateCcw className="w-4 h-4 mr-2" /> Restore
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem onClick={() => setConfirmAction('permanent_delete')} className="cursor-pointer text-rose-500 focus:text-rose-400 hover:bg-white/10 focus:bg-white/10">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Permanently
              </DropdownMenuItem>
            </>
          )}

        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationDialog
        isOpen={confirmAction !== 'none'}
        onClose={() => setConfirmAction('none')}
        onConfirm={handleConfirmAction}
        title={dialogConfig.title}
        description={dialogConfig.description}
        confirmText={dialogConfig.confirmText}
        isDestructive={dialogConfig.isDestructive}
        isLoading={isLoading}
      />
    </>
  )
}
