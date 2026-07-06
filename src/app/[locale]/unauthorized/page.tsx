import { Button } from '@/components/ui/button';
import { Lock, Home } from 'lucide-react';
import { Link } from '@/lib/i18n/routing';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[80vh] bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100 shadow-sm">
          <Lock className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-charcoal mb-4">
          Restricted Access
        </h1>
        <p className="text-[#6B655C] mb-8 leading-relaxed">
          This section of the museum is restricted to authorized personnel only. Your current membership level does not permit access.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-charcoal hover:bg-[#2A2A2A] text-white rounded-full px-6">
            <Link href="/dashboard">
              Return to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-6 border-[#E5E0D8]">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Main Hall
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
