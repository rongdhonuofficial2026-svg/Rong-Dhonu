import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface StatisticsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
}

export function StatisticsCard({
  title,
  value,
  description,
  icon,
  trend,
  className
}: StatisticsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
          {icon && <div className="text-accent">{icon}</div>}
        </div>
        
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-serif font-bold text-foreground">{value}</h2>
          
          {trend && (
            <span className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              trend.positive !== false ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {trend.positive !== false ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
        
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-2">
            {trend ? trend.label : description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
