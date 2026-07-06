import { Button } from '@/components/ui/button';
import { Search, Home } from 'lucide-react';
import { Link } from '@/lib/i18n/routing';
import { useLocale } from 'next-intl';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        <div className="text-[120px] font-serif font-bold text-accent-gold/20 leading-none mb-4">
          404
        </div>
        <h1 className="font-serif text-3xl font-bold text-charcoal mb-4">
          Gallery Not Found
        </h1>
        <p className="text-[#6B655C] mb-8 leading-relaxed">
          The exhibition room or artwork you are looking for has been moved or no longer exists in our collection.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-charcoal hover:bg-[#2A2A2A] text-white rounded-full px-6">
            <Link href="/gallery">
              <Search className="w-4 h-4 mr-2" />
              Explore Gallery
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-6 border-[#E5E0D8]">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
