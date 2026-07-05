import { AlertCircle, FileX2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface StateProps {
  title?: string
  description?: string
  className?: string
  icon?: React.ReactNode
}

export function EmptyState({
  title = "No results found",
  description = "We couldn't find anything matching your criteria.",
  className,
  icon
}: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-muted/30", className)}>
      <div className="rounded-full bg-secondary p-4 mb-4 text-muted-foreground">
        {icon || <FileX2 className="w-8 h-8 opacity-50" />}
      </div>
      <h3 className="font-serif text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm">{description}</p>
    </div>
  )
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading this content.",
  className,
  icon
}: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center border border-destructive/20 rounded-xl bg-destructive/5", className)}>
      <div className="rounded-full bg-destructive/10 p-4 mb-4 text-destructive">
        {icon || <AlertCircle className="w-8 h-8" />}
      </div>
      <h3 className="font-serif text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm">{description}</p>
    </div>
  )
}

export function LoadingState({
  title = "Loading...",
  description,
  className
}: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center", className)}>
      <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
      <h3 className="font-serif text-xl font-medium text-foreground">{title}</h3>
      {description && <p className="text-muted-foreground mt-2 max-w-sm">{description}</p>}
    </div>
  )
}
