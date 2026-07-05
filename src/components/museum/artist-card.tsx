import Image from "next/image"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ArtistCardProps {
  name: string
  role?: string
  bioSnippet?: string
  avatarUrl?: string
  className?: string
  onClick?: () => void
}

export function ArtistCard({
  name,
  role,
  bioSnippet,
  avatarUrl,
  className,
  onClick
}: ArtistCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <Card 
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-md hover:border-accent/50",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      <CardContent className="p-6 flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 border-2 border-border mb-4 transition-transform duration-500 group-hover:scale-105">
          <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
          <AvatarFallback className="bg-muted text-lg font-serif text-muted-foreground">{initials}</AvatarFallback>
        </Avatar>
        
        <h3 className="font-serif text-xl font-bold text-foreground line-clamp-1">{name}</h3>
        
        {role && (
          <p className="text-sm font-medium text-accent mt-1 uppercase tracking-wider">{role}</p>
        )}
        
        {bioSnippet && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
            {bioSnippet}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
