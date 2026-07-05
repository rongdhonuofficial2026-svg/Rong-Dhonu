'use client'

import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export function GalleryFilters({ locale }: { locale: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full bg-muted/20 p-4 rounded-xl border border-border">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder={locale === 'bn' ? "শিল্পকর্ম খুঁজুন..." : "Search artworks..."} 
          className="pl-10 bg-background border-none"
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => {
            // Debounce in a real app
            const val = e.target.value
            setTimeout(() => handleFilterChange('q', val), 500)
          }}
        />
      </div>

      <div className="flex gap-4">
        <Select 
          defaultValue={searchParams.get('medium') || 'all'}
          onValueChange={(val) => handleFilterChange('medium', val)}
        >
          <SelectTrigger className="w-[180px] bg-background border-none">
            <SelectValue placeholder={locale === 'bn' ? "মাধ্যম" : "Medium"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === 'bn' ? "সকল মাধ্যম" : "All Mediums"}</SelectItem>
            <SelectItem value="oil">{locale === 'bn' ? "তৈলচিত্র" : "Oil on Canvas"}</SelectItem>
            <SelectItem value="watercolor">{locale === 'bn' ? "জলরং" : "Watercolor"}</SelectItem>
            <SelectItem value="acrylic">{locale === 'bn' ? "অ্যাক্রিলিক" : "Acrylic"}</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          defaultValue={searchParams.get('year') || 'all'}
          onValueChange={(val) => handleFilterChange('year', val)}
        >
          <SelectTrigger className="w-[150px] bg-background border-none">
            <SelectValue placeholder={locale === 'bn' ? "বছর" : "Year"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === 'bn' ? "সকল বছর" : "All Years"}</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
