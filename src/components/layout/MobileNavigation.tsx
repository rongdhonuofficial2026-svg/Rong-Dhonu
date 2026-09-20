'use client'

import * as React from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Link } from "@/lib/i18n/routing"
import { useTranslations } from "next-intl"

export function MobileNavigation() {
  const [open, setOpen] = React.useState(false)
  const t = useTranslations('Navigation')

  const navItems = [
    { name: t('home'), href: '/' },
    { name: t('about'), href: '/about' },
    { name: t('exhibitions'), href: '/exhibitions' },
    { name: t('gallery'), href: '/gallery' },
    { name: t('catalogs'), href: '/catalogs' },
    { name: t('contact'), href: '/contact' },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11 text-[#F4EEDF] hover:bg-white/10"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="mobile-nav-sheet"
      >
        <SheetHeader className="mobile-nav-header text-left space-y-0">
          <SheetTitle className="mobile-nav-title text-left">Rongdhonu</SheetTitle>
        </SheetHeader>

        <nav className="mobile-nav-body" aria-label="Mobile navigation">
          <div className="mobile-nav-links">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="mobile-nav-link"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="mobile-nav-footer">
          <Button 
            asChild 
            className="w-full justify-center bg-white hover:bg-white/90 text-[#0B0908] font-semibold border border-white/20 shadow-sm"
            style={{ backgroundColor: '#ffffff', color: '#0B0908' }}
          >
            <Link href="/login" onClick={() => setOpen(false)} style={{ color: '#0B0908' }}>
              {t('login')}
            </Link>
          </Button>
          <Button 
            asChild 
            className="w-full justify-center bg-[#F4C662] text-[#0B0908] hover:bg-[#ebd083] font-semibold shadow-sm"
            style={{ backgroundColor: '#F4C662', color: '#0B0908' }}
          >
            <Link href="/register" onClick={() => setOpen(false)} style={{ color: '#0B0908' }}>
              {t('register')}
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
