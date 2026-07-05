import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';

export default function Footer() {
  const t = useTranslations('Navigation');

  return (
    <footer className="bg-charcoal text-white py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-serif text-2xl font-bold mb-4 text-accent-gold">Rongdhono</h3>
          <p className="text-gray-400 text-sm">
            An artists&apos; collective organizing annual art exhibitions at Silva Tirtha Art Gallery, Berhampore.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/about" className="hover:text-accent-gold transition-colors">{t('about')}</Link></li>
            <li><Link href="/exhibitions" className="hover:text-accent-gold transition-colors">{t('exhibitions')}</Link></li>
            <li><Link href="/gallery" className="hover:text-accent-gold transition-colors">{t('gallery')}</Link></li>
            <li><Link href="/contact" className="hover:text-accent-gold transition-colors">{t('contact')}</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/privacy" className="hover:text-accent-gold transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-accent-gold transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold mb-4">Connect</h4>
          <div className="flex gap-4">
            {/* Social Icons would go here */}
            <a href="#" className="text-gray-400 hover:text-accent-gold transition-colors">FB</a>
            <a href="#" className="text-gray-400 hover:text-accent-gold transition-colors">IG</a>
            <a href="#" className="text-gray-400 hover:text-accent-gold transition-colors">YT</a>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Rongdhono. All rights reserved.
      </div>
    </footer>
  );
}
