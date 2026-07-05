import Image from "next/image"
import { CalendarIcon, MapPinIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/lib/i18n/routing"

interface ExhibitionCardProps {
  id: string
  title: string
  status: "upcoming" | "ongoing" | "past" | "draft" | "active"
  startDate: Date
  endDate: Date
  venue: string
  coverImageUrl?: string
  className?: string
}

export function ExhibitionCard({
  id,
  title,
  status,
  startDate,
  endDate,
  venue,
  coverImageUrl,
  className
}: ExhibitionCardProps) {
  
  const formattedDates = `${startDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} — ${endDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`

  return (
    <Link href={`/exhibitions/${id}`} className={cn("group block overflow-hidden bg-background", className)}>
      <div className="flex flex-col md:flex-row h-full">
        {/* Image Section */}
        <div className="relative w-full md:w-2/5 aspect-[4/3] md:aspect-auto md:min-h-[400px] overflow-hidden bg-muted">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <span className="text-muted-foreground font-serif italic">No Cover Image</span>
            </div>
          )}
          <div className="absolute top-4 left-4">
            <Badge 
              variant={status === 'ongoing' || status === 'active' ? 'default' : status === 'upcoming' ? 'secondary' : 'outline'}
              className={cn(
                "uppercase tracking-[0.2em] text-[10px] font-bold px-3 py-1.5 shadow-xl backdrop-blur-md rounded-none border-0",
                (status === 'ongoing' || status === 'active') ? "bg-black/80 text-white" : "bg-white/90 text-black"
              )}
            >
              {status === 'active' ? 'ongoing' : status}
            </Badge>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="w-full md:w-3/5 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-muted/10 border border-t-0 md:border-t md:border-l-0 border-border/50 group-hover:bg-muted/20 transition-colors duration-500">
          <div className="space-y-6">
            <h3 className="font-serif text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight group-hover:text-black/70 transition-colors duration-300">
              {title}
            </h3>
            
            <div className="h-[1px] w-12 bg-foreground/20 group-hover:w-full transition-all duration-700 ease-out" />
            
            <div className="space-y-4 text-muted-foreground pt-4">
              <div className="flex items-center gap-4">
                <CalendarIcon className="h-5 w-5 shrink-0 text-foreground/40" strokeWidth={1.5} />
                <span className="font-light tracking-wide text-lg text-foreground/80">{formattedDates}</span>
              </div>
              <div className="flex items-center gap-4">
                <MapPinIcon className="h-5 w-5 shrink-0 text-foreground/40" strokeWidth={1.5} />
                <span className="font-light tracking-wide text-lg text-foreground/80">{venue}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex items-center gap-4 text-sm font-semibold uppercase tracking-widest text-foreground group-hover:gap-6 transition-all duration-300">
            <span>Explore Exhibition</span>
            <span className="h-[1px] w-8 bg-foreground block" />
          </div>
        </div>
      </div>
    </Link>
  )
}
