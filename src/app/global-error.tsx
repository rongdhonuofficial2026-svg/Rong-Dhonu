/* eslint-disable @next/next/no-html-link-for-pages */
// global-error.tsx renders OUTSIDE the Next.js Router tree, so next/link cannot be used here.
// A plain <a> tag is intentional and correct in this context.
'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error monitoring service in production
    console.error('Global Error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gray-950 text-white font-sans p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="text-8xl font-bold text-red-500 opacity-30 select-none">500</div>
          <h1 className="text-3xl font-bold">Something went wrong</h1>
          <p className="text-gray-400 leading-relaxed">
            An unexpected error occurred. Our team has been notified. Please try refreshing the page.
          </p>
          {process.env.NODE_ENV === 'development' && error.message && (
            <pre className="text-left text-xs bg-gray-900 text-red-400 p-4 rounded-lg overflow-auto max-h-40">
              {error.message}
            </pre>
          )}
          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Try again
            </button>
            <a
              href="/"
              className="px-6 py-3 border border-gray-700 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
