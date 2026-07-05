import { CalendarIcon, MapPinIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/lib/i18n/routing"
import { PremiumImage } from "@/components/ui/PremiumImage"

interface ExhibitionCardProps {
  id: string
  title: string
  status: "upcoming" | "ongoing" | "past" | "draft" | "active" | "completed" | "archived"
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
  
  const isActive = status === 'ongoing' || status === 'active' || status === 'upcoming'

  return (
    <Link href={`/exhibitions/${id}`} className={cn("group block overflow-hidden bg-background shadow-2xl hover:shadow-3xl transition-shadow duration-700 rounded-sm", className)}>
      <div className="flex flex-col md:flex-row h-full">
        {/* Image Section */}
        <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto md:min-h-[500px] overflow-hidden bg-[#1A1A1A]">
          <PremiumImage
            src={coverImageUrl}
            fallbackSrc="/images/placeholders/exhibition.webp"
            alt={title}
            fill
            className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
          
          <div className="absolute top-6 left-6 z-10">
            <Badge 
              variant={isActive ? 'default' : 'outline'}
              className={cn(
                "uppercase tracking-[0.2em] text-[10px] font-bold px-4 py-2 shadow-2xl backdrop-blur-md rounded-none border-0",
                isActive ? "bg-white/90 text-black" : "bg-black/80 text-white"
              )}
            >
              {status === 'active' ? 'ongoing' : status}
            </Badge>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-white relative">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="space-y-8 relative z-10">
            <h3 className="font-serif text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight group-hover:text-black/70 transition-colors duration-300">
              {title}
            </h3>
            
            <div className="h-[2px] w-16 bg-foreground/20 group-hover:w-full group-hover:bg-accent/40 transition-all duration-700 ease-out" />
            
            <div className="space-y-5 text-muted-foreground pt-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center shrink-0">
                  <CalendarIcon className="h-4 w-4 text-foreground/60" strokeWidth={1.5} />
                </div>
                <span className="font-light tracking-wide text-lg text-foreground/80">{formattedDates}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center shrink-0">
                  <MapPinIcon className="h-4 w-4 text-foreground/60" strokeWidth={1.5} />
                </div>
                <span className="font-light tracking-wide text-lg text-foreground/80">{venue}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16 flex items-center gap-4 text-sm font-semibold uppercase tracking-widest text-foreground group-hover:gap-8 transition-all duration-300 relative z-10">
            <span>Explore Exhibition</span>
            <span className="h-[1px] w-12 bg-foreground block" />
          </div>
        </div>
      </div>
    </Link>
  )
}
