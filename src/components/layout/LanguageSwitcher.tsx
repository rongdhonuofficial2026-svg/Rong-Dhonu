'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/lib/i18n/routing'
import { Button } from '@/components/ui/button'
import { Languages } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <span className="uppercase text-xs font-semibold">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[120px]">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('en')}
          className={locale === 'en' ? 'bg-accent/10 text-accent font-semibold' : ''}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('bn')}
          className={locale === 'bn' ? 'bg-accent/10 text-accent font-semibold' : ''}
        >
          বাংলা (Bengali)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
