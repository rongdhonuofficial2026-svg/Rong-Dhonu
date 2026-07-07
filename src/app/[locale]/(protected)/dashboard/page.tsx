import { createClient } from "@/lib/supabase/server"
import { DashboardHero } from "@/components/dashboard/ui/DashboardHero"
import { DashboardStatistics } from "@/components/dashboard/ui/DashboardStatistics"
import { DashboardTimeline } from "@/components/dashboard/ui/DashboardTimeline"
import { DashboardAnnouncements } from "@/components/dashboard/ui/DashboardAnnouncements"

export default async function DashboardOverview({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Fetch Artworks Stats
  const { data: artworks } = await supabase
    .from('artworks')
    .select('status')
    .eq('artist_id', user.id)

  const stats = {
    total: artworks?.length || 0,
    approved: artworks?.filter(a => a.status === 'approved').length || 0,
    pending: artworks?.filter(a => a.status === 'pending').length || 0,
    rejected: artworks?.filter(a => a.status === 'rejected').length || 0,
  }

  // Fetch Current Exhibition for Countdown
  const { data: exhibition } = await supabase
    .from('exhibitions')
    .select('*')
    .in('status', ['active', 'upcoming'])
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  const name = locale === 'bn' ? (profile?.full_name_bn || profile?.full_name_en) : profile?.full_name_en

  // Mock announcements for now until DB table is verified
  const announcements = [
    {
      id: "1",
      title_en: "Call for Summer Collection 2026",
      title_bn: "গ্রীষ্মকালীন সংগ্রহ ২০২৬ এর জন্য আহ্বান",
      message_en: "Submissions are now open for all members. Ensure your artworks follow the new sizing guidelines.",
      message_bn: "সকল সদস্যদের জন্য জমা দেওয়া এখন উন্মুক্ত। নিশ্চিত করুন আপনার শিল্পকর্মগুলি নতুন আকারের নির্দেশিকা অনুসরণ করে।",
      date: new Date().toISOString()
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <DashboardHero name={name || 'Artist'} locale={locale} />
      
      <DashboardStatistics stats={stats} locale={locale} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DashboardTimeline exhibition={exhibition} locale={locale} />
        </div>
        
        <div className="lg:col-span-1">
          <DashboardAnnouncements announcements={announcements} locale={locale} />
        </div>
      </div>
    </div>
  )
}
