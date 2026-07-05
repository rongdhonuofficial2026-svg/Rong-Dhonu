import { AlertCircle, FileX2, Loader2, Sparkles, AlertTriangle, SearchX } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"

interface StateProps {
  title?: string
  description?: string
  className?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({
  title = "Collection Empty",
  description = "There are currently no artworks or exhibitions to display in this gallery space.",
  className,
  icon,
  action
}: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-16 text-center w-full min-h-[50vh] bg-[#FDFBF7]", className)}>
      <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[#1C1C1E]/5 mb-10 relative group">
          <div className="absolute inset-0 rounded-full border border-[#1C1C1E]/10 group-hover:scale-110 transition-transform duration-700 ease-out" />
          {icon || <SearchX className="w-8 h-8 text-[#1C1C1E]/40" strokeWidth={1} />}
        </div>
        
        <h3 className="font-serif text-3xl md:text-4xl text-[#1C1C1E] mb-6 tracking-tight">{title}</h3>
        <p className="text-[#1C1C1E]/60 text-lg font-light leading-relaxed mb-10">{description}</p>
        
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

export function ErrorState({
  title = "Gallery Temporarily Closed",
  description = "We encountered an issue while curating this collection. Please return shortly.",
  className,
  icon,
  action
}: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-16 text-center w-full min-h-[50vh] bg-[#111111] text-[#FDFBF7]", className)}>
      <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
        <div className="flex items-center justify-center w-24 h-24 rounded-full border border-[#D4AF37]/30 mb-10 relative">
          <div className="absolute inset-0 bg-[#D4AF37]/5 rounded-full" />
          {icon || <AlertTriangle className="w-8 h-8 text-[#D4AF37]" strokeWidth={1} />}
        </div>
        
        <h3 className="font-serif text-3xl md:text-4xl mb-6 tracking-tight">{title}</h3>
        <p className="text-[#FDFBF7]/60 text-lg font-light leading-relaxed mb-10">{description}</p>
        
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

export function LoadingState({
  title = "Curating...",
  description = "Preparing the collection for your viewing.",
  className
}: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-16 text-center w-full min-h-[50vh] bg-[#FDFBF7]", className)}>
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-20 h-20 mb-10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[1px] border-[#1C1C1E]/10" />
          <div className="absolute inset-0 rounded-full border-[1px] border-[#D4AF37] border-t-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        
        <h3 className="font-serif text-2xl text-[#1C1C1E] tracking-widest uppercase text-sm font-semibold mb-4">{title}</h3>
        {description && <p className="text-[#1C1C1E]/50 text-sm tracking-widest font-light">{description}</p>}
      </div>
    </div>
  )
}
