import { Link } from '@/lib/i18n/routing'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileNavigation } from './MobileNavigation'
import { SearchOverlay } from './SearchOverlay'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const t = useTranslations('Navigation')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-accent">
              Rongdhono
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-accent text-foreground/80">{t('home')}</Link>
          <Link href="/about" className="transition-colors hover:text-accent text-foreground/80">{t('about')}</Link>
          <Link href="/exhibitions" className="transition-colors hover:text-accent text-foreground/80">{t('exhibitions')}</Link>
          <Link href="/gallery" className="transition-colors hover:text-accent text-foreground/80">{t('gallery')}</Link>
          <Link href="/contact" className="transition-colors hover:text-accent text-foreground/80">{t('contact')}</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex">
            <SearchOverlay />
          </div>
          <LanguageSwitcher />
          
          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">{t('login')}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">{t('register')}</Link>
            </Button>
          </div>

          <MobileNavigation />
        </div>

      </div>
    </header>
  )
}
