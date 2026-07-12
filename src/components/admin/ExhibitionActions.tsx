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
  updateExhibitionFeatureStatus,
  type DeletionReport
} from "@/actions/admin/exhibitions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Link } from "@/lib/i18n/routing"
import { ConfirmationDialog } from "@/components/admin/ui/ConfirmationDialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"

export function ExhibitionActions({ exhibition, locale }: { exhibition: any, locale: string }) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [confirmAction, setConfirmAction] = React.useState<'none' | 'archive' | 'delete' | 'permanent_delete'>('none')
  const [deletionReport, setDeletionReport] = React.useState<DeletionReport | null>(null)
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
      executePermanentDelete()
    }
  }

  const executePermanentDelete = async () => {
    setIsLoading(true)
    try {
      const res = await permanentDeleteExhibition(exhibition.id)
      if (res.error) {
        toast.error("Deletion Failed", { description: res.error })
      } else if (res.report) {
        // Show report dialogue
        setDeletionReport(res.report)
        router.refresh()
      }
    } catch (err: any) {
      toast.error("Unexpected Error", { description: err.message || "An unexpected error occurred." })
    } finally {
      setIsLoading(false)
      setConfirmAction('none')
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

      <Dialog open={!!deletionReport} onOpenChange={() => setDeletionReport(null)}>
        <DialogContent className="sm:max-w-[550px] bg-[#1C1C1E] border-border text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {deletionReport?.verificationPassed ? (
                <span className="text-emerald-500 flex items-center gap-2"><Trash2 className="w-5 h-5"/> Deletion Successful</span>
              ) : (
                <span className="text-amber-500 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Deletion Completed with Warnings</span>
              )}
            </DialogTitle>
            <DialogDescription>
              Summary for: <span className="font-semibold text-white">{deletionReport?.exhibitionName}</span>
            </DialogDescription>
          </DialogHeader>
          
          {deletionReport && (
            <ScrollArea className="max-h-[60vh] pr-4 mt-4">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                    <p className="text-sm text-muted-foreground mb-1">Artworks Removed</p>
                    <p className="text-2xl font-semibold font-mono">{deletionReport.artworksRemoved}</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                    <p className="text-sm text-muted-foreground mb-1">Gallery Media</p>
                    <p className="text-2xl font-semibold font-mono">{deletionReport.galleryMediaRemoved}</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                    <p className="text-sm text-muted-foreground mb-1">Catalogs</p>
                    <p className="text-2xl font-semibold font-mono">{deletionReport.catalogsRemoved}</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                    <p className="text-sm text-muted-foreground mb-1">Participants</p>
                    <p className="text-2xl font-semibold font-mono">{deletionReport.participantsRemoved}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Storage Actions</h4>
                  <div className="flex items-center justify-between text-sm p-3 bg-black/20 rounded-lg border border-white/5">
                    <span>Files successfully deleted</span>
                    <span className="font-mono text-emerald-400">{deletionReport.storageFilesRemoved}</span>
                  </div>
                  {deletionReport.storageFilesQueuedForRetry > 0 && (
                    <div className="flex items-center justify-between text-sm p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-500">
                      <span>Files queued for retry</span>
                      <span className="font-mono">{deletionReport.storageFilesQueuedForRetry}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Cache Invalidation</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${deletionReport.homepageRefreshed ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      Homepage & Global Caches
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${deletionReport.searchRefreshed ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      Search Index & Results
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${deletionReport.statisticsRefreshed ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      Dashboard Statistics
                    </li>
                  </ul>
                </div>

                {deletionReport.warnings && deletionReport.warnings.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Warnings
                    </h4>
                    <ul className="text-sm space-y-2 bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg text-amber-200/90">
                      {deletionReport.warnings.map((warning, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="shrink-0 mt-0.5">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeletionReport(null)} className="w-full sm:w-auto">
              Close Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
