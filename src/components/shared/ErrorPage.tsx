'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
  context?: 'public' | 'admin' | 'dashboard'
}

export function ErrorPage({ error, reset, context = 'public' }: ErrorPageProps) {
  useEffect(() => {
    console.error(`[${context}] Error:`, error)
  }, [error, context])

  const homeHref = context === 'admin' ? '/en/admin' : context === 'dashboard' ? '/en/dashboard' : '/en'
  const homeLabel = context === 'admin' ? 'Admin Dashboard' : context === 'dashboard' ? 'My Dashboard' : 'Home'

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-serif">Something went wrong</h2>
          <p className="text-muted-foreground leading-relaxed">
            An unexpected error occurred. Please try again or return to the previous page.
          </p>
          {process.env.NODE_ENV === 'development' && error.message && (
            <pre className="mt-4 text-left text-xs bg-muted text-destructive p-4 rounded-lg overflow-auto max-h-32 font-mono">
              {error.message}
            </pre>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href={homeHref} className="gap-2 flex items-center">
              <Home className="w-4 h-4" />
              {homeLabel}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
