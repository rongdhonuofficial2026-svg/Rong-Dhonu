import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import { MapPin, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer({ footerData, locale = 'en', settingsData }: { footerData?: any, locale?: string, settingsData?: any }) {
  const t = useTranslations('Navigation');

  let parsedQuickLinks: any[] = []
  try {
    const rawVal = footerData?.quick_links
    if (rawVal) {
      parsedQuickLinks = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal
    }
  } catch (e) {}

  let parsedLegalLinks: any[] = []
  try {
    const rawVal = footerData?.legal_links
    if (rawVal) {
      parsedLegalLinks = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal
    }
  } catch (e) {}

  return (
    <footer className="relative bg-[#1C1C1E] text-[#E6E2D3] pt-24 pb-12 mt-auto overflow-hidden border-t border-white/5">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/canvas.png')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />

      
      <div className="container relative z-10 mx-auto px-4 md:px-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20 text-left">
          
          {/* Brand & Address */}
          <div className="lg:col-span-4 flex flex-col space-y-8">
            <div>
              <h3 className="font-serif text-4xl font-bold tracking-tight text-[#FDFBF7] mb-2">{settingsData?.site_name || 'Rongdhono'}</h3>
              <p className="text-white/50 text-sm uppercase tracking-widest font-medium">Artists' Collective</p>
            </div>
            <p className="text-white/60 font-light leading-relaxed max-w-sm">
              {footerData?.brand_description || 'Cultivating contemporary art and preserving cultural heritage through annual exhibitions, fostering a thriving ecosystem for artists.'}
            </p>
            <div className="flex flex-col space-y-3 text-sm text-white/50 font-light">
              <span className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                {footerData?.address || 'Silva Tirtha Art Gallery, Berhampore'}
              </span>
              <span className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                {footerData?.email || 'contact@rongdhono.org'}
              </span>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="lg:col-span-2 lg:col-start-6 flex flex-col">
            <h4 className="font-serif text-xl font-medium text-white mb-6">Explore</h4>
            <ul className="space-y-4 text-sm font-light">
              {parsedQuickLinks && parsedQuickLinks.length > 0 ? (
                parsedQuickLinks.map((link: any, idx: number) => (
                  <li key={idx}>
                    <Link href={link.href} className="text-white/60 hover:text-[#D4AF37] transition-colors">
                      {locale === 'bn' ? (link.label_bn || link.label_en) : link.label_en}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/" className="text-white/60 hover:text-[#D4AF37] transition-colors">{t('home')}</Link></li>
                  <li><Link href="/about" className="text-white/60 hover:text-[#D4AF37] transition-colors">{t('about')}</Link></li>
                  <li><Link href="/exhibitions" className="text-white/60 hover:text-[#D4AF37] transition-colors">{t('exhibitions')}</Link></li>
                  <li><Link href="/gallery" className="text-white/60 hover:text-[#D4AF37] transition-colors">{t('gallery')}</Link></li>
                  <li><Link href="/contact" className="text-white/60 hover:text-[#D4AF37] transition-colors">{t('contact')}</Link></li>
                </>
              )}
            </ul>
          </div>
          
          {/* Legal */}
          <div className="lg:col-span-2 flex flex-col">
            <h4 className="font-serif text-xl font-medium text-white mb-6">Legal</h4>
            <ul className="space-y-4 text-sm font-light">
              {parsedLegalLinks && parsedLegalLinks.length > 0 ? (
                parsedLegalLinks.map((link: any, idx: number) => (
                  <li key={idx}>
                    <Link href={link.href} className="text-white/60 hover:text-[#D4AF37] transition-colors">
                      {locale === 'bn' ? (link.label_bn || link.label_en) : link.label_en}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/privacy" className="text-white/60 hover:text-[#D4AF37] transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-white/60 hover:text-[#D4AF37] transition-colors">Terms of Service</Link></li>
                  <li><Link href="/cookie-policy" className="text-white/60 hover:text-[#D4AF37] transition-colors">Cookie Policy</Link></li>
                </>
              )}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="lg:col-span-3 flex flex-col">
            <h4 className="font-serif text-xl font-medium text-white mb-6">Stay Inspired</h4>
            <p className="text-white/60 text-sm font-light mb-6">
              Subscribe to receive updates on upcoming exhibitions, new artists, and gallery events.
            </p>
            <form className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email address" 
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#D4AF37] rounded-none h-10"
              />
              <Button type="button" className="rounded-none bg-[#D4AF37] text-black hover:bg-[#FDFBF7] transition-colors h-10 px-4">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
          
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40 font-light tracking-wide">
            &copy; {new Date().getFullYear()} {settingsData?.copyright_text || "Rongdhono Artists' Collective. All rights reserved."}
          </p>
          
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-[#D4AF37] transition-colors flex items-center justify-center w-5 h-5" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" className="text-white/40 hover:text-[#D4AF37] transition-colors flex items-center justify-center w-5 h-5" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </a>
            <a href="#" className="text-white/40 hover:text-[#D4AF37] transition-colors flex items-center justify-center w-5 h-5" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
