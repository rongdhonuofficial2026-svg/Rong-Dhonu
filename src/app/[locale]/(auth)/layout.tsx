import { getCmsContent } from '@/lib/cms/content';
import { Link } from '@/lib/i18n/routing';

export default async function AuthLayout({ 
  children,
  params
}: { 
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settingsData = await getCmsContent('global', 'settings', locale);
  const siteName = settingsData?.site_name || 'Rongdhonu';

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-xl shadow-lg auth-public-shell">
        <div className="text-center">
          <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-accent-indigo">
            {siteName}
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
