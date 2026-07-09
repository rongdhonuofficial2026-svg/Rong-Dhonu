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
    <header className={cn("site-nav", isScrolled && "scrolled")}>
      {/* Logo */}
      <Link href="/" className="brand">
        {settingsData?.logo_url && settingsData.logo_url !== '/images/logo.png' && (
          <img 
            src={settingsData.logo_url} 
            alt={settingsData.site_name || 'Logo'} 
            className="h-8 w-auto object-contain mr-2"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <span className="brand-word">{locale === 'bn' ? 'রংধনু' : 'Rongdhono'}</span>
      </Link>

      {/* Desktop Nav */}
      <nav className="nav-links">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(isActive && "active")}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Right Actions */}
      <div className="nav-actions">
        <div className="nav-icon-btn nav-action-search">
          <SearchOverlay />
        </div>
        
        <div className="nav-icon-btn lang nav-action-lang">
          <LanguageSwitcher />
        </div>
        
        <Link 
          href="/login"
          className="nav-login nav-action-login"
        >
          {t('login')}
        </Link>
        <Link 
          href="/register"
          className="btn btn-sm btn-gold magnetic nav-action-register"
        >
          {t('register')}
        </Link>
      </div>

      {/* Mobile Nav — outside .nav-actions so it stays visible below 760px */}
      <div className="nav-burger">
        <MobileNavigation />
      </div>
    </header>
  );
}
