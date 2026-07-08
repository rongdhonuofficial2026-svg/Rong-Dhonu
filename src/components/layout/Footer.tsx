import { Link } from '@/lib/i18n/routing';

export default function Footer({ footerData, locale = 'en', settingsData }: { footerData?: any, locale?: string, settingsData?: any }) {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link href="/" className="brand">
            <span className="brand-word">{locale === 'bn' ? 'রংধনু' : 'Rongdhono'}</span>
          </Link>
          <p>
            {locale === 'bn'
              ? 'প্রদর্শনী, ক্যাটালগ এবং শিল্পী ও গুণগ্রাহীদের জন্য একটি সমৃদ্ধ নেটওয়ার্কের মাধ্যমে সমসাময়িক শিল্পের বিকাশ এবং সংরক্ষণ করা।'
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
                <path d="M4 4l16 16M20 4L4 20" stroke="#F4EEDF" strokeWidth="1.6" stroke-linecap="round"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>{locale === 'bn' ? 'অন্বেষণ' : 'Explore'}</h4>
          <ul>
            <li><Link href="/about">{locale === 'bn' ? 'রংধনু সম্পর্কে' : 'About Rongdhono'}</Link></li>
            <li><Link href="/exhibitions">{locale === 'bn' ? 'বার্ষিক প্রদর্শনী' : 'Annual Exhibitions'}</Link></li>
            <li><Link href="/artists">{locale === 'bn' ? 'শিল্পী ডিরেক্টরি' : 'Artists Directory'}</Link></li>
            <li><Link href="/gallery">{locale === 'bn' ? 'কিউরেটেড কালেকশন' : 'Curated Collection'}</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{locale === 'bn' ? 'অফিস' : 'Office'}</h4>
          <ul>
            <li><a href="#" onClick={(e) => e.preventDefault()}>{locale === 'bn' ? '১২ আর্ট কলেজ রোড' : '12 Art College Road'}</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>{locale === 'bn' ? 'গোরাবাজার, বহরমপুর' : 'Gorabazar, Berhampore'}</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>{locale === 'bn' ? 'পশ্চিমবঙ্গ ৭৪২১০১' : 'West Bengal 742101'}</a></li>
            <li><a href="mailto:info@rongdhono.art">info@rongdhono.art</a></li>
          </ul>
        </div>

        <div className="footer-col footer-newsletter">
          <h4>{locale === 'bn' ? 'অনুপ্রাণিত থাকুন' : 'Stay Inspired'}</h4>
          <p>
            {locale === 'bn'
              ? 'নতুন প্রদর্শনী এবং স্টুডিওর গল্পগুলোর নিয়মিত আপডেট পেতে সাবস্ক্রাইব করুন।'
              : 'Get occasional notes on new exhibitions and studio stories.'}
          </p>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="you@email.com" required />
            <button type="submit" className="btn btn-gold btn-sm magnetic" style={{ width: '100%' }}>
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
