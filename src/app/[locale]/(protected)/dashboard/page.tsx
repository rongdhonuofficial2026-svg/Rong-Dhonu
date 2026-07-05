import { createClient } from "@/lib/supabase/server"
import { SectionHeading } from "@/components/museum/section-heading"
import { StatisticsCard } from "@/components/museum/statistics-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/routing"
import { Palette, Clock, CheckCircle, AlertCircle, Upload, Bell } from "lucide-react"

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
    .single()

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
    .single()

  const name = locale === 'bn' ? (profile?.full_name_bn || profile?.full_name_en) : profile?.full_name_en

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">
            {locale === 'bn' ? `স্বাগতম, ${name || 'শিল্পী'}` : `Welcome back, ${name || 'Artist'}`}
          </h1>
          <p className="text-muted-foreground text-lg">
            {locale === 'bn' ? "আপনার শিল্পী ড্যাশবোর্ডে স্বাগতম।" : "Here's what's happening with your artworks and exhibitions."}
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0 gap-2">
          <Link href="/dashboard/artworks/new">
            <Upload className="w-5 h-5" />
            {locale === 'bn' ? "নতুন শিল্পকর্ম জমা দিন" : "Submit New Artwork"}
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatisticsCard 
          title={locale === 'bn' ? "মোট শিল্পকর্ম" : "Total Submissions"} 
          value={stats.total.toString()} 
          icon={<Palette />} 
        />
        <StatisticsCard 
          title={locale === 'bn' ? "অনুমোদিত" : "Approved"} 
          value={stats.approved.toString()} 
          icon={<CheckCircle className="text-green-500" />} 
        />
        <StatisticsCard 
          title={locale === 'bn' ? "অপেক্ষমান" : "Pending Review"} 
          value={stats.pending.toString()} 
          icon={<Clock className="text-yellow-500" />} 
        />
        <StatisticsCard 
          title={locale === 'bn' ? "প্রত্যাখ্যাত" : "Needs Attention"} 
          value={stats.rejected.toString()} 
          icon={<AlertCircle className="text-red-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Exhibition Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{locale === 'bn' ? "বর্তমান প্রদর্শনী স্থিতি" : "Current Exhibition Status"}</CardTitle>
            <CardDescription>
              {exhibition 
                ? (locale === 'bn' ? (exhibition.title_bn || exhibition.title_en) : exhibition.title_en)
                : (locale === 'bn' ? "কোনো সক্রিয় প্রদর্শনী নেই" : "No active exhibition")
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exhibition ? (
              <div className="space-y-6">
                <div className="bg-muted p-6 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      {locale === 'bn' ? "জমা দেওয়ার শেষ তারিখ" : "Submission Deadline"}
                    </p>
                    <p className="font-serif text-3xl font-bold text-accent">
                      {new Date(exhibition.submission_deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href="/dashboard/artworks">{locale === 'bn' ? "আপনার জমাগুলি দেখুন" : "View Your Submissions"}</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {locale === 'bn' ? "আমরা বর্তমানে নতুন প্রদর্শনীর জন্য প্রস্তুতি নিচ্ছি।" : "We are currently preparing for the next exhibition cycle."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notifications / Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'bn' ? "সাম্প্রতিক ঘোষণা" : "Announcements"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
                <Bell className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Call for Summer Collection 2026</p>
                  <p className="text-xs text-muted-foreground mt-1">Submissions are now open for all members.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
