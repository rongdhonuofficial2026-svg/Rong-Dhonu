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

export function Navbar({ menuItems, locale = 'en', settingsData }: { menuItems?: any[], locale?: string, settingsData?: any }) {
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

  const navItems = menuItems && menuItems.length > 0
    ? menuItems.map((item: any) => ({ 
        name: locale === 'bn' ? (item.label_bn || item.label_en) : item.label_en, 
        href: item.href 
      }))
    : [
        { name: t('home'), href: '/' },
        { name: t('about'), href: '/about' },
        { name: t('exhibitions'), href: '/exhibitions' },
        { name: t('gallery'), href: '/gallery' },
        { name: t('catalogs'), href: '/catalogs' },
        { name: t('contact'), href: '/contact' },
      ]

  // If on home page and not scrolled, the navbar is transparent with light text (assuming dark hero).
  // Otherwise, it's solid/glass with dark text.
  const isTransparent = isHome && !isScrolled
  
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-[0.19,1,0.22,1] border-b",
        isScrolled 
          ? "bg-[#0B0908]/90 border-white/[0.08] backdrop-blur-[16px] py-4.5 shadow-xl shadow-black/25" 
          : "bg-transparent border-transparent py-6.5"
      )}
    >
      <div className="max-w-[1320px] mx-auto flex items-center justify-between px-6 md:px-12">
        
        {/* Logo */}
        <div className="flex items-center gap-2 relative z-10">
          <Link href="/" className="flex items-center space-x-2 group">
            {settingsData?.logo_url && settingsData.logo_url !== '/images/logo.png' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={settingsData.logo_url} 
                alt={settingsData.site_name || 'Logo'} 
                className="h-8 w-auto object-contain mr-2"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <span className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#F4EEDF] group-hover:text-[#F4C662] transition-colors duration-500">
              {settingsData?.site_name || 'Rongdhono'}
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-9 relative z-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={cn(
                  "relative text-[13px] font-semibold uppercase tracking-wider transition-colors duration-300",
                  isActive 
                    ? "text-[#F4C662]" 
                    : "text-[#F4EEDF]/72 hover:text-[#F4EEDF]"
                )}
              >
                {item.name}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-2.5 left-0 right-0 h-[1.5px] bg-[#F4C662]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
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
          
          <div className="opacity-90 hover:opacity-100 transition-opacity">
            <LanguageSwitcher />
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login"
              className="text-[13px] font-semibold text-[#F4EEDF]/72 hover:text-[#F4EEDF] uppercase tracking-wider transition-colors px-3 py-1.5"
            >
              {t('login')}
            </Link>
            <Link 
              href="/register"
              className="btn btn-sm btn-gold font-semibold text-[12px] uppercase tracking-widest px-5 py-2.5 rounded-full active:scale-[0.97]"
            >
              {t('register')}
            </Link>
          </div>

          <div className="lg:hidden text-[#F4EEDF]">
            <MobileNavigation />
          </div>
        </div>

      </div>
    </header>
  )
}
