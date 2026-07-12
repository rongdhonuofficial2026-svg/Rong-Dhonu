import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/Sidebar'
import { DebugErrorBoundary } from '@/components/DebugErrorBoundary'
import { Toaster } from '@/components/ui/sonner'
import '@/styles/responsive-admin.css'

import { getUserRole, canAccessAdmin } from '@/lib/auth/roles'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  // Get current user session
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    redirect(`/${locale}/login`)
  }

  // Check if user is admin, owner, or committee
  const role = await getUserRole(supabase, session.user.id, session.user.email)

  if (!canAccessAdmin(role)) {
    redirect(`/${locale}/dashboard`)
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
