import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // 1. Next-Intl handles Locale
  const response = intlMiddleware(request);

  // 2. Supabase Auth Check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // Apply to the intl response
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  // Remove locale prefix for checking paths
  const pathWithoutLocale = pathname.replace(/^\/(en|bn)/, '') || '/';

  // Protect /dashboard routes
  if (pathWithoutLocale.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone();
      const currentLocale = pathname.split('/')[1] || 'en';
      url.pathname = `/${currentLocale}/login`;
      return NextResponse.redirect(url);
    }
  }

  // Protect /admin routes
  if (pathWithoutLocale.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      const currentLocale = pathname.split('/')[1] || 'en';
      url.pathname = `/${currentLocale}/login`;
      return NextResponse.redirect(url);
    }

    // Check Role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'committee' && profile?.role !== 'owner') {
      const url = request.nextUrl.clone();
      const currentLocale = pathname.split('/')[1] || 'en';
      url.pathname = `/${currentLocale}/unauthorized`; // Or wherever you want to send unauthorized users
      return NextResponse.redirect(url);
    }
  }
  
  // Bounce authenticated users from auth pages
  if (pathWithoutLocale === '/login' || pathWithoutLocale === '/register') {
    if (user) {
      const url = request.nextUrl.clone();
      const currentLocale = pathname.split('/')[1] || 'en';
      url.pathname = `/${currentLocale}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames and api/trpc
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
