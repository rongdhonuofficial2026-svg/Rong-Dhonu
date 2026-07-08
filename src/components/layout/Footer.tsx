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
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link href="/" className="brand">
            <span className="brand-word">{locale === 'bn' ? 'রংধনু' : 'Rongdhono'}</span>
          </Link>
          <p>
            {locale === 'bn'
              ? 'প্রদর্শনী, ক্যাটালগ এবং শিল্পী ও গুণগ্রাহীদের জন্য একটি সমৃদ্ধ নেটওয়ার্কের মাধ্যমে সমসাময়িক শিল্পের বিকাশ এবং সাংস্কৃতিক ঐতিহ্য সংরক্ষণ করা।'
              : (footerData?.brand_description || 'Cultivating contemporary art and preserving cultural heritage through exhibitions, catalogues, and a thriving network for artists and appreciators alike.')}
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="#F4EEDF" strokeWidth="1.6"/>
                <circle cx="12" cy="12" r="4" stroke="#F4EEDF" strokeWidth="1.6"/>
                <circle cx="17.5" cy="6.5" r="1" fill="#F4EEDF"/>
              </svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" fill="#F4EEDF"/>
              </svg>
            </a>
            <a href="#" aria-label="X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 4l16 16M20 4L4 20" stroke="#F4EEDF" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>{locale === 'bn' ? 'অন্বেষণ' : 'Explore'}</h4>
          <ul>
            <li><Link href="/about">{locale === 'bn' ? 'আমাদের সম্পর্কে' : 'About Rongdhono'}</Link></li>
            <li><Link href="/exhibitions">{locale === 'bn' ? 'বার্ষিক প্রদর্শনী' : 'Annual Exhibitions'}</Link></li>
            <li><Link href="/artists">{locale === 'bn' ? 'শিল্পীগণ' : 'Artists'}</Link></li>
            <li><Link href="/gallery">{locale === 'bn' ? 'গ্যালারি' : 'Gallery'}</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{locale === 'bn' ? 'আইনি' : 'Legal'}</h4>
          <ul>
            <li><Link href="/privacy">{locale === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</Link></li>
            <li><Link href="/terms">{locale === 'bn' ? 'পরিষেবার শর্তাবলী' : 'Terms of Service'}</Link></li>
            <li><Link href="/cookie-policy">{locale === 'bn' ? 'কুকি নীতি' : 'Cookie Policy'}</Link></li>
          </ul>
        </div>

        <div className="footer-col footer-newsletter">
          <h4>{locale === 'bn' ? 'অনুপ্রাণিত থাকুন' : 'Stay Inspired'}</h4>
          <p style={{ fontSize: '13px', color: 'var(--color-parchment-faint)', marginBottom: '14px', lineHeight: '1.6' }}>
            {locale === 'bn'
              ? 'নতুন প্রদর্শনী এবং স্টুডিওর গল্পগুলোর নিয়মিত আপডেট পেতে সাবস্ক্রাইব করুন।'
              : 'Get occasional notes on new exhibitions and studio stories.'}
          </p>
          <form>
            <input type="email" placeholder={locale === 'bn' ? 'আপনার ইমেইল' : 'you@email.com'} required />
            <button type="button" className="btn btn-gold btn-sm magnetic w-full">
              {locale === 'bn' ? 'সাবস্ক্রাইব করুন' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 {settingsData?.copyright_text || "Rongdhono Artists' Collective. All rights reserved."}</span>
        <span>{locale === 'bn' ? 'বহরমপুর, পশ্চিমবঙ্গ, ভারত' : 'Berhampore, West Bengal, India'}</span>
      </div>
    </footer>
  );
}
