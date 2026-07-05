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
    { name: t('contact'), href: '/contact' },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left font-serif text-2xl text-accent">Rongdhono</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-lg font-medium text-foreground/80 hover:text-accent transition-colors py-2 border-b border-border/50"
            >
              {item.name}
            </Link>
          ))}
          
          <div className="mt-8 flex flex-col gap-3">
            <Button asChild variant="outline" className="w-full justify-center">
              <Link href="/login" onClick={() => setOpen(false)}>{t('login')}</Link>
            </Button>
            <Button asChild className="w-full justify-center">
              <Link href="/register" onClick={() => setOpen(false)}>{t('register')}</Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
