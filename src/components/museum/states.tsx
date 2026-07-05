import { AlertCircle, FileX2, Loader2, Sparkles, AlertTriangle } from "lucide-react"
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
  title = "No results found",
  description = "We couldn't find anything matching your criteria.",
  className,
  icon,
  action
}: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-16 text-center w-full min-h-[400px] relative overflow-hidden bg-muted/20 border border-border/40", className)}>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background border border-border shadow-sm mb-8 relative">
          <div className="absolute inset-0 rounded-full border border-border/50 scale-125 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
          {icon || <Sparkles className="w-6 h-6 text-muted-foreground/60" />}
        </div>
        
        <h3 className="font-serif text-3xl font-bold text-foreground mb-4 tracking-tight">{title}</h3>
        <p className="text-muted-foreground/80 text-lg font-light leading-relaxed mb-8">{description}</p>
        
        {action && (
          <div className="mt-2">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading this content.",
  className,
  icon,
  action
}: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-16 text-center w-full min-h-[400px] relative overflow-hidden bg-destructive/5 border border-destructive/10", className)}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-destructive/0 via-destructive/50 to-destructive/0" />
      
      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-8 border border-destructive/20 shadow-sm">
          {icon || <AlertTriangle className="w-6 h-6" strokeWidth={1.5} />}
        </div>
        
        <h3 className="font-serif text-3xl font-bold text-foreground mb-4 tracking-tight">{title}</h3>
        <p className="text-muted-foreground/80 text-lg font-light leading-relaxed mb-8">{description}</p>
        
        {action && (
          <div className="mt-2">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

export function LoadingState({
  title = "Curating...",
  description = "Please wait while we prepare the collection.",
  className
}: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-16 text-center w-full min-h-[400px] relative", className)}>
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[1.5px] border-border" />
          <div className="absolute inset-0 rounded-full border-[1.5px] border-foreground border-t-transparent animate-spin" />
        </div>
        
        <h3 className="font-serif text-2xl font-bold text-foreground tracking-tight mb-2">{title}</h3>
        {description && <p className="text-muted-foreground/60 text-sm tracking-widest uppercase mt-2">{description}</p>}
      </div>
    </div>
  )
}
