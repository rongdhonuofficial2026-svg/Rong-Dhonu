'use client'

import { useEffect } from 'react'
import { Link } from '@/lib/i18n/routing'
import { Button } from '@/components/ui/button'
import { BookOpen, AlertTriangle } from 'lucide-react'

export default function CatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background pb-20 pt-32 flex flex-col items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6 shadow-sm border border-destructive/20">
          <AlertTriangle className="w-10 h-10 text-destructive/80" />
        </div>
        
        <h1 className="text-3xl font-serif font-bold mb-4">
          Failed to Load Catalog
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          We encountered an unexpected error while trying to retrieve this catalog. It might have been moved or deleted.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} variant="default" size="lg">
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/catalogs" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Return to Archive
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
