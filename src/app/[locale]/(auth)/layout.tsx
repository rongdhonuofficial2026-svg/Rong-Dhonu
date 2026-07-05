import { Link } from '@/lib/i18n/routing';
import { useTranslations } from 'next-intl';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('Navigation');
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-accent-indigo">
            Rongdhono
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
