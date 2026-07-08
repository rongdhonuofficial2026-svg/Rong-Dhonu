import { CalendarIcon, MapPinIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/lib/i18n/routing"
import { PremiumImage } from "@/components/ui/PremiumImage"

interface ExhibitionCardProps {
  id: string
  title: string
  status: "upcoming" | "ongoing" | "past" | "draft" | "active" | "completed" | "archived"
  startDate: Date | null
  endDate: Date | null
  venue?: string | null
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
  
  const formattedDates = startDate && endDate
    ? `${startDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} — ${endDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}`
    : 'Dates TBD'
  
  const isActive = status === 'ongoing' || status === 'active' || status === 'upcoming'

  return (
    <Link href={`/exhibitions/${id}`} className={cn("group block overflow-hidden bg-[#F4EEDF] border border-[#DCCFAE] hover:shadow-3xl transition-all duration-700 ease-[0.19,1,0.22,1]", className)}>
      <div className="flex flex-col md:flex-row h-full relative">
        {/* Crimson top edge on hover */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#B4233A] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20" />

        {/* Image Section */}
        <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto md:min-h-[500px] overflow-hidden bg-[#151210] border-r border-[#DCCFAE]">
          <PremiumImage
            src={coverImageUrl}
            fallbackSrc="/images/placeholders/exhibition.webp"
            alt={title}
            fill
            className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
          
          <div className="absolute top-6 left-6 z-10">
            <Badge 
              variant="outline"
              className="uppercase tracking-[0.2em] text-[10px] font-bold px-4 py-2 bg-[#0B0908]/90 text-white rounded-none border border-[#F4C662]/30"
            >
              {status === 'active' ? 'ongoing' : status}
            </Badge>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-[#F4EEDF] relative">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B4233A]/5 rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="space-y-8 relative z-10">
            <h3 className="font-serif text-4xl lg:text-5xl font-bold text-[#1E1A16] leading-tight tracking-tight group-hover:text-[#B4233A] transition-colors duration-300">
              {title}
            </h3>
            
            <div className="h-[1.5px] w-16 bg-[#DCCFAE] group-hover:w-full group-hover:bg-[#B4233A]/40 transition-all duration-700 ease-[0.19,1,0.22,1]" />
            
            <div className="space-y-5 text-[#5C5347] pt-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#DCCFAE] flex items-center justify-center shrink-0 bg-[#EFE6D2]">
                  <CalendarIcon className="h-4 w-4 text-[#1E1A16]/60" strokeWidth={1.5} />
                </div>
                <span className="font-light tracking-wide text-lg text-[#1E1A16]/85">{formattedDates}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#DCCFAE] flex items-center justify-center shrink-0 bg-[#EFE6D2]">
                  <MapPinIcon className="h-4 w-4 text-[#1E1A16]/60" strokeWidth={1.5} />
                </div>
                <span className="font-light tracking-wide text-lg text-[#1E1A16]/85">{venue}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16 flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#1E1A16] group-hover:text-[#B4233A] group-hover:gap-8 transition-all duration-300 relative z-10">
            <span>Explore Exhibition</span>
            <span className="h-[1px] w-12 bg-[#1E1A16] group-hover:bg-[#B4233A] block" />
          </div>
        </div>
      </div>
    </Link>
  )
}
