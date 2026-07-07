'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Home } from 'lucide-react';
import { Link } from '@/lib/i18n/routing';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-[#E5E0D8]">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-100">
          <RefreshCcw className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-charcoal mb-4">
          Something went wrong
        </h1>
        <p className="text-[#6B655C] mb-8 leading-relaxed">
          We encountered an unexpected error while preparing this gallery for you. Please try refreshing or return to the main hall.
        </p>
        
        {/* DEBUGGING OUTPUT */}
        <div className="bg-red-50 text-red-900 p-4 rounded-md text-left text-sm font-mono overflow-auto mb-8 whitespace-pre-wrap max-h-96">
          <strong>{error.name}: {error.message}</strong>
          <br /><br />
          {error.stack}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => reset()} 
            className="bg-charcoal hover:bg-[#2A2A2A] text-white rounded-full px-6"
          >
            Try again
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
