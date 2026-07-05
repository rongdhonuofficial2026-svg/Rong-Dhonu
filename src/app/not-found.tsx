import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-gray-950 px-4">
      <div className="max-w-lg text-center space-y-8">
        {/* Decorative brush stroke number */}
        <div className="relative">
          <span className="text-[10rem] font-serif font-bold leading-none text-charcoal/10 dark:text-white/5 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-serif font-bold text-charcoal dark:text-white">
              404
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-serif font-bold text-charcoal dark:text-white">
            Page Not Found
          </h1>
          <p className="text-lg text-charcoal/60 dark:text-white/60 leading-relaxed">
            The page you are looking for does not exist or may have been moved.
          </p>
          <p className="text-base text-charcoal/50 dark:text-white/50 font-serif italic">
            এই পৃষ্ঠাটি খুঁজে পাওয়া যাচ্ছে না।
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/en"
            className="px-8 py-3 bg-charcoal dark:bg-white text-cream dark:text-charcoal rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Go to Homepage
          </Link>
          <Link
            href="/en/exhibitions"
            className="px-8 py-3 border border-charcoal/20 dark:border-white/20 rounded-lg font-semibold hover:bg-charcoal/5 dark:hover:bg-white/5 transition-colors text-charcoal dark:text-white"
          >
            View Exhibitions
          </Link>
        </div>
      </div>
    </div>
  )
}
