import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import '@/styles/globals.css';
import { Inter, Playfair_Display, Noto_Sans_Bengali, Noto_Serif_Bengali } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const notoSansBn = Noto_Sans_Bengali({ subsets: ['bengali'], variable: '--font-sans-bn' });
const notoSerifBn = Noto_Serif_Bengali({ subsets: ['bengali'], variable: '--font-serif-bn' });

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
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable} ${notoSansBn.variable} ${notoSerifBn.variable}`}>
      <body className="min-h-screen flex flex-col font-sans text-charcoal bg-cream">
        <NextIntlClientProvider messages={messages}>
          {/* Accessibility: skip navigation for keyboard/screen reader users */}
          <a href="#main-content" className="skip-to-content">
            {locale === 'bn' ? 'মূল বিষয়বস্তুতে যান' : 'Skip to main content'}
          </a>
          <Navbar />
          <main id="main-content" className="flex-grow" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
