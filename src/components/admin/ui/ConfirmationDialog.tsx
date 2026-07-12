'use client'

import * as React from "react"
import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
  requiredConfirmationString?: string
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
  requiredConfirmationString
}: ConfirmationDialogProps) {
  const [inputValue, setInputValue] = useState("")

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setInputValue("")
      onClose()
    }
  }

  const isConfirmDisabled = isLoading || (requiredConfirmationString && inputValue !== requiredConfirmationString)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-[#1C1C1E] border border-border/40 text-white shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="font-serif text-2xl tracking-tight text-white">
            {title}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm font-light leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        {requiredConfirmationString && (
          <div className="mt-4 space-y-2">
            <label className="text-xs text-zinc-400 font-medium">
              Type <span className="text-red-400 font-bold">{requiredConfirmationString}</span> to confirm
            </label>
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-white focus:border-red-500 transition-colors"
              placeholder={requiredConfirmationString}
            />
          </div>
        )}

        <DialogFooter className="mt-6 flex gap-3 justify-end">
          <DialogClose asChild>
            <Button 
              type="button" 
              variant="ghost" 
              disabled={isLoading}
              className="text-zinc-400 hover:text-white hover:bg-white/5 border-none"
              onClick={onClose}
            >
              {cancelText}
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={isConfirmDisabled as boolean}
            variant={isDestructive ? "destructive" : "default"}
            onClick={() => {
              onConfirm()
              setInputValue("")
            }}
            className={`min-w-[100px] font-semibold ${
              isDestructive 
                ? "bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50" 
                : "bg-primary text-primary-foreground hover:bg-primary/95 disabled:opacity-50"
            }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
