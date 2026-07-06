import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/Sidebar'
import { TopNavigation } from '@/components/admin/TopNavigation'

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

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect(`/${locale}/dashboard`)
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Global Grain Texture Overlay */}
      <div className="grain-overlay" />
      
      {/* Floating Sidebar Navigation */}
      <AdminSidebar locale={locale} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden relative scroll-smooth">
        
        {/* Floating Top Navigation */}
        <TopNavigation />
        
        {/* Page Content Container */}
        <div className="flex-1 px-6 pb-12 w-full max-w-7xl mx-auto">
          {children}
        </div>
        
      </main>
    </div>
  )
}
