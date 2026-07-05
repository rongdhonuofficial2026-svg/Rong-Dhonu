'use client'

import React, { useState, useEffect } from 'react'
import { Link, usePathname } from '@/lib/i18n/routing'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileNavigation } from './MobileNavigation'
import { SearchOverlay } from './SearchOverlay'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const t = useTranslations('Navigation')
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const isHome = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    // Check initial position
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: t('home'), href: '/' },
    { name: t('about'), href: '/about' },
    { name: t('exhibitions'), href: '/exhibitions' },
    { name: t('gallery'), href: '/gallery' },
    { name: t('contact'), href: '/contact' },
  ]

  // If on home page and not scrolled, the navbar is transparent with light text (assuming dark hero).
  // Otherwise, it's solid/glass with dark text.
  const isTransparent = isHome && !isScrolled
  
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-700 ease-[0.16,1,0.3,1]",
        isTransparent 
          ? "bg-transparent border-transparent py-8" 
          : "glass py-4 shadow-sm"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 md:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2 relative z-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className={cn(
              "font-serif text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-500",
              isTransparent ? "text-white group-hover:text-white/80" : "text-accent group-hover:text-accent/80"
            )}>
              Rongdhono
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 relative z-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={cn(
                  "relative text-sm uppercase tracking-[0.1em] font-medium transition-colors duration-300",
                  isTransparent 
                    ? "text-white/90 hover:text-white" 
                    : "text-foreground/70 hover:text-foreground",
                  isActive && (isTransparent ? "text-white" : "text-accent")
                )}
              >
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className={cn(
                      "absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
                      isTransparent ? "bg-white" : "bg-accent"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 md:gap-6 relative z-10">
          <div className="hidden sm:flex">
            <SearchOverlay />
          </div>
          
          <div className={cn(
            "transition-opacity duration-300",
            isTransparent ? "opacity-90 hover:opacity-100" : ""
          )}>
            <LanguageSwitcher />
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <Button 
              asChild 
              variant="ghost" 
              className={cn(
                "uppercase tracking-wider text-xs font-semibold transition-colors rounded-none",
                isTransparent 
                  ? "text-white hover:bg-white/10 hover:text-white" 
                  : "text-foreground hover:bg-muted"
              )}
            >
              <Link href="/login">{t('login')}</Link>
            </Button>
            <Button 
              asChild 
              className={cn(
                "uppercase tracking-wider text-xs font-semibold rounded-none px-6 transition-transform hover:scale-[1.02]",
                isTransparent
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-accent text-accent-foreground hover:bg-accent/90"
              )}
            >
              <Link href="/register">{t('register')}</Link>
            </Button>
          </div>

          <div className={cn(
            "lg:hidden",
            isTransparent ? "text-white" : "text-foreground"
          )}>
            <MobileNavigation />
          </div>
        </div>

      </div>
    </header>
  )
}
