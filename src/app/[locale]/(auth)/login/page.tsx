import { LoginForm } from './LoginForm';
import { generateDynamicMetadata } from '@/lib/seo';
import { getCmsContent } from '@/lib/cms/content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const settingsData = await getCmsContent('global', 'settings', locale);
  
  const siteName = settingsData?.site_name || 'Rongdhonu';
  const faviconUrl = settingsData?.favicon_url;

  return generateDynamicMetadata({
    title: locale === 'bn' ? "লগইন" : "Login",
    description: locale === 'bn' ? "রংধনু শিল্পী সংঘে আপনার অ্যাকাউন্টে লগইন করুন।" : "Sign in to your Rongdhonu artists' collective account.",
    url: '/login',
    locale,
    siteName,
    faviconUrl,
  });
}

export default function LoginPage() {
  return <LoginForm />;
}
