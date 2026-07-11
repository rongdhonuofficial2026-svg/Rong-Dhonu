import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { UserManager } from "@/components/admin/users/UserManager"
import { getUsers } from "@/actions/admin/users"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'bn' ? 'ব্যবহারকারী ডিরেক্টরি | রঙধনু' : 'User Directory | Rongdhonu',
  }
}

export default async function UserManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  // 1. Authorization check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/${locale}/login`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'owner')) {
    notFound() // Curators/committee/members cannot access this route
  }

  // 2. Fetch initial users data for SSR
  const res = await getUsers({
    page: 1,
    limit: 12,
    sort: 'newest'
  })

  const initialUsers = res.success ? (res.users || []) : []
  const totalCount = res.success ? (res.totalCount || 0) : 0

  return (
    <UserManager 
      initialUsers={initialUsers} 
      totalCount={totalCount} 
      locale={locale} 
    />
  )
}
