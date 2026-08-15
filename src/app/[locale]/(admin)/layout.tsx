import { redirect } from 'next/navigation'
import { getCachedUser } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/Sidebar'
import { DebugErrorBoundary } from '@/components/DebugErrorBoundary'
import { Toaster } from '@/components/ui/sonner'
import '@/styles/responsive-admin.css'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Role-based access is already fully verified by middleware.ts on every request
  // matched by its config (which covers all /admin/* paths, including client-side
  // RSC navigation fetches) — it redirects unauthorized/unauthenticated requests to
  // /login or /unauthorized before this layout ever renders, so re-running
  // getUserRole()'s DB query here was pure duplicate work. Identity is still
  // verified with the real, network-revalidated getUser() — not a downgraded local
  // cookie read — via getCachedUser(), which memoizes that call per request (React
  // cache()) so pages under this layout that also need the user (admin/page.tsx,
  // users/page.tsx, etc.) don't pay for a second Supabase Auth round-trip. Same
  // pattern already used across the (protected)/dashboard route group.
  const { user, error } = await getCachedUser()

  if (error || !user) {
    redirect(`/${locale}/login`)
  }

  return (
    <div data-admin-shell className="relative min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden">
      {/* Global Grain Texture Overlay */}
      <div className="grain-overlay" />
      
      {/* Floating Sidebar Navigation */}
      <DebugErrorBoundary id="AdminSidebar">
        <AdminSidebar locale={locale} />
      </DebugErrorBoundary>
      
      {/* Main Content Area */}
      <main className="admin-main flex-1 flex flex-col min-w-0 min-h-0 h-[100dvh] md:h-screen overflow-y-auto overflow-x-hidden relative scroll-smooth">
        
        {/* Page Content Container */}
        <div className="admin-content flex-1 px-4 pt-4 pb-10 md:px-6 md:pt-12 md:pb-12 w-full max-w-7xl mx-auto">
          <DebugErrorBoundary id="PageContent">
            {children}
          </DebugErrorBoundary>
        </div>
        
      </main>
      {/* Admin-scoped toast portal */}
      <Toaster richColors closeButton position="bottom-right" />
    </div>
  )
}
