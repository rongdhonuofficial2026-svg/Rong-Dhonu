import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import '@/styles/globals.css';
import { Inter, Fraunces, Noto_Sans_Bengali, Noto_Serif_Bengali } from 'next/font/google';
import localFont from 'next/font/local';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-serif' });
const notoSansBn = Noto_Sans_Bengali({ subsets: ['bengali'], variable: '--font-sans-bn' });
const notoSerifBn = Noto_Serif_Bengali({ subsets: ['bengali'], variable: '--font-serif-bn' });

const calligraphicAfera = localFont({
  src: '../../../public/fonts/calligraphicaferabeautytrial-bold.otf',
  variable: '--font-afera',
  weight: '700',
  style: 'normal',
});

const arsenica = localFont({
  src: [
    {
      path: '../../../public/fonts/ArsenicaTrial-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/ArsenicaTrial-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/ArsenicaTrial-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    }
  ],
  variable: '--font-arsenica',
});

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
    <html lang={locale} className={`${inter.variable} ${fraunces.variable} ${notoSansBn.variable} ${notoSerifBn.variable} ${calligraphicAfera.variable} ${arsenica.variable}`}>
      <body className="min-h-screen flex flex-col font-sans text-charcoal bg-cream">
        <NextIntlClientProvider messages={messages}>
          {/* Accessibility: skip navigation for keyboard/screen reader users */}
          <a href="#main-content" className="skip-to-content">
            {locale === 'bn' ? 'মূল বিষয়বস্তুতে যান' : 'Skip to main content'}
          </a>
          <main id="main-content" className="flex-grow flex flex-col" tabIndex={-1}>
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
