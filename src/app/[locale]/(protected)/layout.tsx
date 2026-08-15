import { redirect } from "next/navigation"
import { getCachedUser } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/Sidebar"


export default async function ProtectedLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Verify authentication. Memoized per-request via getCachedUser(), so pages
  // rendered under this layout that also need the user don't pay for a second
  // Supabase Auth round-trip.
  const { user, error } = await getCachedUser()

  if (error || !user) {
    redirect(`/${locale}/login`)
  }

  return (
    <div className="flex min-h-screen bg-muted/10">
      <DashboardSidebar locale={locale} userId={user.id} />
      
      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72 pt-16 lg:pt-0">
        <div className="h-full w-full max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
