import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';
import { createServerClient } from '@supabase/ssr';

import { getUserRole, canAccessAdmin, resolveDashboardRoute } from './lib/auth/roles';

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
  // Remove locale prefix for checking paths dynamically
  const localeRegex = new RegExp(`^/(${routing.locales.join('|')})`);
  const pathWithoutLocale = pathname.replace(localeRegex, '') || '/';
  const currentLocale = pathname.split('/')[1] || routing.defaultLocale;

  // Fetch role if user exists
  let role = 'guest';
  if (user) {
    role = await getUserRole(supabase, user.id, user.email);
  }

  // Protect /dashboard routes
  if (pathWithoutLocale.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = `/${currentLocale}/login`;
      return NextResponse.redirect(url);
    }

    if (canAccessAdmin(role)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${currentLocale}/admin`;
      return NextResponse.redirect(url);
    }
  }

  // Protect /admin routes
  if (pathWithoutLocale.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = `/${currentLocale}/login`;
      return NextResponse.redirect(url);
    }

    if (!canAccessAdmin(role)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${currentLocale}/unauthorized`;
      return NextResponse.redirect(url);
    }
  }
  
  // Bounce authenticated users from auth pages or base /dashboard route appropriately
  if (pathWithoutLocale === '/login' || pathWithoutLocale === '/register') {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = `/${currentLocale}${resolveDashboardRoute(role)}`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames and api/trpc
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};
