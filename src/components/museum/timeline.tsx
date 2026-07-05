import { cn } from "@/lib/utils"

export interface TimelineItem {
  id: string
  title: string
  description?: string
  date?: string
  status: "completed" | "current" | "upcoming"
}

interface TimelineProps {
  items: TimelineItem[]
  className?: string
  orientation?: "vertical" | "horizontal"
}

export function Timeline({ items, className, orientation = "vertical" }: TimelineProps) {
  if (orientation === "horizontal") {
    return (
      <div className={cn("relative flex w-full justify-between", className)}>
        {/* Horizontal Line */}
        <div className="absolute top-4 left-0 h-[2px] w-full bg-border" />
        
        {items.map((item, index) => (
          <div key={item.id} className="relative z-10 flex flex-col items-center flex-1">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center border-2 bg-background transition-colors",
              item.status === "completed" ? "border-accent bg-accent" : 
              item.status === "current" ? "border-accent" : "border-border"
            )}>
              {item.status === "completed" && (
                <svg className="w-4 h-4 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {item.status === "current" && (
                <div className="h-2.5 w-2.5 rounded-full bg-accent" />
              )}
            </div>
            <div className="mt-4 text-center">
              <h4 className={cn(
                "text-sm font-bold",
                item.status !== "upcoming" ? "text-foreground" : "text-muted-foreground"
              )}>{item.title}</h4>
              {item.date && (
                <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Vertical Timeline
  return (
    <div className={cn("relative space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10",
            item.status === "completed" ? "border-accent bg-accent" : 
            item.status === "current" ? "border-accent" : "border-border"
          )}>
            {item.status === "completed" && (
              <svg className="w-4 h-4 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {item.status === "current" && (
              <div className="h-2.5 w-2.5 rounded-full bg-accent" />
            )}
          </div>
          
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-1">
              <h4 className={cn(
                "font-bold font-serif text-lg",
                item.status !== "upcoming" ? "text-foreground" : "text-muted-foreground"
              )}>
                {item.title}
              </h4>
              {item.date && (
                <time className="text-xs font-semibold text-accent uppercase tracking-wider">{item.date}</time>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
