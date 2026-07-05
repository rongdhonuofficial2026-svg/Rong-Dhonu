import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/Sidebar"

export default async function AdminLayout({
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

  // Strictly verify Admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'owner', 'committee'].includes(profile.role)) {
    redirect(`/${locale}/unauthorized`)
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex-col md:flex-row">
      <AdminSidebar locale={locale} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full max-w-[100vw]">
        {children}
      </main>
    </div>
  )
}
