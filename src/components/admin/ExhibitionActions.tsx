'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Copy, Archive, Loader2 } from "lucide-react"
import { duplicateExhibition, archiveExhibition } from "@/actions/admin/exhibitions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ExhibitionActions({ id, locale }: { id: string, locale: string }) {
  const [isDuplicating, setIsDuplicating] = React.useState(false)
  const [isArchiving, setIsArchiving] = React.useState(false)
  const router = useRouter()

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    const res = await duplicateExhibition(id)
    if (res.error) {
      toast.error("Error", { description: res.error })
    } else {
      toast.success("Success", { description: "Exhibition duplicated successfully." })
      router.refresh()
    }
    setIsDuplicating(false)
  }

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this exhibition?")) return
    setIsArchiving(true)
    const res = await archiveExhibition(id)
    if (res.error) {
      toast.error("Error", { description: res.error })
    } else {
      toast.success("Success", { description: "Exhibition archived." })
      router.refresh()
    }
    setIsArchiving(false)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="icon" onClick={handleDuplicate} disabled={isDuplicating || isArchiving} title="Duplicate">
        {isDuplicating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
      </Button>
      <Button variant="outline" size="icon" onClick={handleArchive} disabled={isDuplicating || isArchiving} title="Archive">
        {isArchiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4 text-destructive" />}
      </Button>
    </div>
  )
}
