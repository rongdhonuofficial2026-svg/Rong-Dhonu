import Image from "next/image"
import { CalendarIcon, MapPinIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/routing"

interface ExhibitionCardProps {
  id: string
  title: string
  status: "upcoming" | "ongoing" | "past" | "draft"
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
  
  const formattedDates = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`

  return (
    <Card className={cn("overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-lg", className)}>
      <div className="relative h-48 w-full bg-muted overflow-hidden">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <span className="text-muted-foreground font-serif italic">No Cover Image</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge 
            variant={status === 'ongoing' ? 'default' : status === 'upcoming' ? 'secondary' : 'outline'}
            className={cn(
              "uppercase tracking-wide font-semibold shadow-sm",
              status === 'ongoing' && "bg-accent text-accent-foreground hover:bg-accent/80",
              status === 'past' && "bg-background/80 backdrop-blur-sm"
            )}
          >
            {status}
          </Badge>
        </div>
      </div>
      
      <CardContent className="flex-1 p-5">
        <h3 className="font-serif text-2xl font-bold text-foreground mb-4 line-clamp-2">{title}</h3>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0 text-accent" />
            <span>{formattedDates}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 shrink-0 text-accent" />
            <span className="line-clamp-1">{venue}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 mt-auto border-t border-border/50 bg-muted/20">
        <Button asChild variant="ghost" className="w-full mt-4 font-semibold hover:bg-accent/10 hover:text-accent">
          <Link href={`/exhibitions/${id}`}>
            View Exhibition Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
