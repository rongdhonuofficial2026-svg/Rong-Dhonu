import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getCmsContent } from '@/lib/cms/content';

export default async function PublicLayout({ 
  children,
  params
}: { 
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Fetch CMS settings
  const navData = await getCmsContent('global', 'navigation', locale);
  const footerData = await getCmsContent('global', 'footer', locale);
  const settingsData = await getCmsContent('global', 'settings', locale);

  const menuItems = navData?.menu_items 
    ? (typeof navData.menu_items === 'string' ? JSON.parse(navData.menu_items) : navData.menu_items)
    : undefined;

  return (
    <>
      <Navbar menuItems={menuItems} locale={locale} settingsData={settingsData} />
      <div className="flex-grow flex flex-col">
        {children}
      </div>
      <Footer footerData={footerData} locale={locale} settingsData={settingsData} />
    </>
  );
}
