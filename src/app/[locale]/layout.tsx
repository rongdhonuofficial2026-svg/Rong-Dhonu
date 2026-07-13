import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from '@/components/ui/sonner';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import '@/styles/globals.css';
import '@/styles/responsive-public.css';
import '@/styles/responsive-mobile-polish.css';
import { Inter, Fraunces, Noto_Sans_Bengali, Noto_Serif_Bengali, Playfair_Display, Great_Vibes } from 'next/font/google';
import { generateDynamicMetadata } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const greatVibes = Great_Vibes({ weight: '400', subsets: ['latin'], variable: '--font-great-vibes', display: 'swap' });
const notoSansBn = Noto_Sans_Bengali({ subsets: ['bengali'], variable: '--font-sans-bn', display: 'swap' });
const notoSerifBn = Noto_Serif_Bengali({ subsets: ['bengali'], variable: '--font-serif-bn', display: 'swap' });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return generateDynamicMetadata({
    title: locale === 'bn' ? 'রংধনু' : 'Rongdhonu',
    description: locale === 'bn' 
      ? 'রংধনু প্রদর্শনী, কিউরেট করা সংগ্রহ এবং মেধাবী শিল্পীদের মাধ্যমে সমসাময়িক শিল্পের জগত অন্বেষণ করুন।' 
      : 'Explore the world of contemporary art through Rongdhonu exhibitions, curated collections, and talented artists.',
    url: '/',
    locale
  });
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  // Providing all messages to the client side
  const messages = await getMessages();
 
  // Only load Bengali fonts if the locale is Bengali
  const fontVariables = [
    inter.variable,
    fraunces.variable,
    playfair.variable,
    greatVibes.variable,
    locale === 'bn' ? notoSansBn.variable : '',
    locale === 'bn' ? notoSerifBn.variable : ''
  ].filter(Boolean).join(' ');
 
  return (
    <html lang={locale} className={fontVariables}>
      <body className="min-h-screen flex flex-col font-sans text-charcoal bg-cream">
        <NextIntlClientProvider messages={messages}>
          {/* Accessibility: skip navigation for keyboard/screen reader users */}
          <a href="#main-content" className="skip-to-content">
            {locale === 'bn' ? 'মূল বিষয়বস্তুতে যান' : 'Skip to main content'}
          </a>
          <main id="main-content" className="flex-grow flex flex-col" tabIndex={-1}>
            {children}
          </main>
          {/* Global toast portal — must be inside NextIntlClientProvider */}
          <Toaster richColors closeButton position="bottom-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
