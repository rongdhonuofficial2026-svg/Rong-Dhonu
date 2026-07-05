import { Link } from '@/lib/i18n/routing';

export default function UnauthorizedPage() {
  return (
    <div className="text-center py-8">
      <h2 className="text-3xl font-bold tracking-tight text-red-600 mb-4">
        Access Denied
      </h2>
      <p className="text-gray-600 mb-8">
        You do not have permission to access this page. If you believe this is an error, please contact the administrator.
      </p>
      <Link
        href="/"
        className="inline-flex justify-center rounded-md bg-charcoal px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
