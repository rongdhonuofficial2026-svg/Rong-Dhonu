'use client'

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const STAGES = [
  { id: 'draft', label: 'Draft' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'archived', label: 'Archived' }
]

export function LifecycleProgressBar({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStatus)

  return (
    <div className="relative py-8 px-4 bg-muted/20 border border-border/50 rounded-xl mb-8">
      <div className="absolute top-1/2 left-4 right-4 h-1 bg-border/40 -translate-y-1/2 rounded-full overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 bottom-0 bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="relative flex justify-between">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex
          const isCurrent = idx === currentIndex

          return (
            <div key={stage.id} className="flex flex-col items-center gap-3">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500",
                  isCompleted ? "bg-primary text-primary-foreground" : 
                  isCurrent ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : 
                  "bg-muted border-2 border-border text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-sm font-medium">{idx + 1}</span>}
              </div>
              <span className={cn(
                "text-sm font-medium uppercase tracking-wider",
                isCurrent ? "text-foreground" : "text-muted-foreground"
              )}>
                {stage.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
