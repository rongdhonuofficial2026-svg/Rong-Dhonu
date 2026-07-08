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
    <footer className="relative bg-[#0b0908] text-[#F4EEDF]/70 pt-24 pb-12 mt-auto overflow-hidden border-t border-white/[0.08]">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/canvas.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F4C662]/20 to-transparent" />

      <div className="max-w-[1320px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20 text-left">
          
          {/* Brand & Address */}
          <div className="lg:col-span-4 flex flex-col space-y-8">
            <div>
              <h3 className="font-serif text-3xl font-bold tracking-tight text-[#F4EEDF] mb-2">{settingsData?.site_name || 'Rongdhono'}</h3>
              <p className="text-[#F4C662] text-[10px] uppercase tracking-widest font-bold">Artists' Collective</p>
            </div>
            <p className="text-[#F4EEDF]/60 text-sm font-light leading-relaxed max-w-sm">
              {footerData?.brand_description || 'Cultivating contemporary art and preserving cultural heritage through annual exhibitions, fostering a thriving ecosystem for artists.'}
            </p>
            <div className="flex flex-col space-y-3.5 text-xs text-[#F4EEDF]/50 font-mono">
              <span className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#F4C662]" />
                {footerData?.address || 'Silva Tirtha Art Gallery, Berhampore'}
              </span>
              <span className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#F4C662]" />
                {footerData?.email || 'contact@rongdhono.org'}
              </span>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="lg:col-span-2 lg:col-start-6 flex flex-col">
            <h4 className="font-serif text-lg font-medium text-white mb-6">Explore</h4>
            <ul className="space-y-4 text-xs font-medium">
              {parsedQuickLinks && parsedQuickLinks.length > 0 ? (
                parsedQuickLinks.map((link: any, idx: number) => (
                  <li key={idx}>
                    <Link href={link.href} className="text-[#F4EEDF]/60 hover:text-[#F4C662] transition-colors">
                      {locale === 'bn' ? (link.label_bn || link.label_en) : link.label_en}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/" className="text-[#F4EEDF]/60 hover:text-[#F4C662] transition-colors">{t('home')}</Link></li>
                  <li><Link href="/about" className="text-[#F4EEDF]/60 hover:text-[#F4C662] transition-colors">{t('about')}</Link></li>
                  <li><Link href="/exhibitions" className="text-[#F4EEDF]/60 hover:text-[#F4C662] transition-colors">{t('exhibitions')}</Link></li>
                  <li><Link href="/gallery" className="text-[#F4EEDF]/60 hover:text-[#F4C662] transition-colors">{t('gallery')}</Link></li>
                  <li><Link href="/contact" className="text-[#F4EEDF]/60 hover:text-[#F4C662] transition-colors">{t('contact')}</Link></li>
                </>
              )}
            </ul>
          </div>
          
          {/* Legal */}
          <div className="lg:col-span-2 flex flex-col">
            <h4 className="font-serif text-lg font-medium text-white mb-6">Legal</h4>
            <ul className="space-y-4 text-xs font-medium">
              {parsedLegalLinks && parsedLegalLinks.length > 0 ? (
                parsedLegalLinks.map((link: any, idx: number) => (
                  <li key={idx}>
                    <Link href={link.href} className="text-[#F4EEDF]/60 hover:text-[#F4C662] transition-colors">
                      {locale === 'bn' ? (link.label_bn || link.label_en) : link.label_en}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/privacy" className="text-[#F4EEDF]/60 hover:text-[#F4C662] transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-[#F4EEDF]/60 hover:text-[#F4C662] transition-colors">Terms of Service</Link></li>
                  <li><Link href="/cookie-policy" className="text-[#F4EEDF]/60 hover:text-[#F4C662] transition-colors">Cookie Policy</Link></li>
                </>
              )}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="lg:col-span-3 flex flex-col">
            <h4 className="font-serif text-lg font-medium text-white mb-6">Stay Inspired</h4>
            <p className="text-[#F4EEDF]/60 text-xs font-light mb-6 leading-relaxed">
              Subscribe to receive updates on upcoming exhibitions, new artists, and gallery events.
            </p>
            <form className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email address" 
                className="bg-transparent border-t-0 border-x-0 border-b border-white/20 text-white placeholder:text-white/25 focus-visible:ring-0 focus-visible:border-[#F4C662] rounded-none h-11 px-0 text-sm"
              />
              <Button type="button" className="btn btn-sm btn-gold rounded-full h-9 w-9 p-0 flex items-center justify-center min-w-9 shrink-0">
                <ArrowRight className="w-4 h-4 text-black" />
              </Button>
            </form>
          </div>
          
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-mono text-white/40 tracking-wide">
            &copy; {new Date().getFullYear()} {settingsData?.copyright_text || "Rongdhono Artists' Collective. All rights reserved."}
          </p>
          
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-[#F4C662] transition-colors flex items-center justify-center w-5 h-5" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" className="text-white/40 hover:text-[#F4C662] transition-colors flex items-center justify-center w-5 h-5" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </a>
            <a href="#" className="text-white/40 hover:text-[#F4C662] transition-colors flex items-center justify-center w-5 h-5" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
