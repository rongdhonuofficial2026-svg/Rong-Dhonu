import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/Sidebar"

export default async function ProtectedLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  
  // Verify authentication
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect(`/${locale}/login`)
  }

  // Optional: check role if we need to restrict 'admin' from 'member' dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin' || profile?.role === 'owner') {
    // If we have a separate admin dashboard, we could redirect them there
    // redirect(`/${locale}/admin`)
  }

  return (
    <div className="flex min-h-screen bg-muted/10">
      <DashboardSidebar locale={locale} />
      
      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72 pt-16 lg:pt-0">
        <div className="h-full w-full max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
