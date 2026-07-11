'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2, User, Image as ImageIcon, Calendar } from "lucide-react"
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { globalSearch, SearchResultItem } from "@/actions/public/search"
import Image from "next/image"

export function GlobalSearch({ locale }: { locale: string }) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResultItem[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  // Keyboard shortcut Ctrl+K / Cmd+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Debounced search
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true)
        const res = await globalSearch(query, locale)
        setResults(res)
        setIsLoading(false)
      } else {
        setResults([])
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [query, locale])

  const handleSelect = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  const artists = results.filter(r => r.type === 'artist')
  const artworks = results.filter(r => r.type === 'artwork')
  const exhibitions = results.filter(r => r.type === 'exhibition')

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full sm:w-64 justify-start text-muted-foreground font-normal" 
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Search Rongdhonu...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search for artists, artworks, or exhibitions..." 
          value={query} 
          onValueChange={setQuery} 
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? (
              <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
              </div>
            ) : query.trim().length < 2 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Type at least 2 characters to search.</p>
            ) : (
              <p className="p-6 text-center text-sm text-muted-foreground">No results found.</p>
            )}
          </CommandEmpty>
          
          {artists.length > 0 && (
            <CommandGroup heading="Artists">
              {artists.map((item) => (
                <CommandItem key={item.id} onSelect={() => handleSelect(item.href)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                  {item.subtitle && <span className="ml-2 text-xs text-muted-foreground">({item.subtitle})</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {artworks.length > 0 && (
            <CommandGroup heading="Artworks">
              {artworks.map((item) => (
                <CommandItem key={item.id} onSelect={() => handleSelect(item.href)}>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                  {item.subtitle && <span className="ml-2 text-xs text-muted-foreground">by {item.subtitle}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {exhibitions.length > 0 && (
            <CommandGroup heading="Exhibitions">
              {exhibitions.map((item) => (
                <CommandItem key={item.id} onSelect={() => handleSelect(item.href)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
