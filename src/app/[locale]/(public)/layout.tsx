import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getCmsContent } from '@/lib/cms/content';
import { CustomCursor } from '@/components/layout/CustomCursor';

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
    <div className="relative min-h-screen flex flex-col bg-[#0B0908] text-[#F4EEDF]/70 select-none md:select-auto">
      {/* Global Grain Texture Overlay */}
      <div className="grain-overlay" />

      {/* Custom Cursor Overlay */}
      <CustomCursor />

      <Navbar menuItems={menuItems} locale={locale} settingsData={settingsData} />
      <div className="flex-grow flex flex-col relative z-10">
        {children}
      </div>
      <Footer footerData={footerData} locale={locale} settingsData={settingsData} />
    </div>
  );
}
