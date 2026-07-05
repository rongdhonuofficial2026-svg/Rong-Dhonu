import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Image as ImageIcon, Paintbrush, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

export default async function AdminDashboardOverview({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  // Parallel data fetching for performance
  const [
    { count: pendingArtworksCount },
    { count: totalArtworksCount },
    { count: totalArtistsCount },
    { count: activeExhibitionsCount },
    { data: recentAudits }
  ] = await Promise.all([
    supabase.from('artworks').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('artworks').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member'),
    supabase.from('exhibitions').select('*', { count: 'exact', head: true }).in('status', ['active', 'upcoming']),
    supabase.from('audit_logs').select('*, profiles(first_name_en, last_name_en)').order('created_at', { ascending: false }).limit(10)
  ])

  const stats = [
    { label: "Pending Artworks", value: pendingArtworksCount || 0, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Total Artworks", value: totalArtworksCount || 0, icon: ImageIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Registered Artists", value: totalArtistsCount || 0, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Active Exhibitions", value: activeExhibitionsCount || 0, icon: Paintbrush, color: "text-purple-500", bg: "bg-purple-500/10" },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Rongdhono administrative portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="border-border shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle>Recent Audit Logs</CardTitle>
            <CardDescription>Latest administrative and user actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!recentAudits || recentAudits.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No recent activity.</p>
              ) : (
                recentAudits.map((log: any) => (
                  <div key={log.id} className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 items-start">
                    <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {log.profiles ? `${log.profiles.first_name_en} ${log.profiles.last_name_en}` : 'System'} 
                        <span className="text-muted-foreground font-normal ml-2">{log.action}</span>
                      </p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted p-2 rounded inline-block">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(log.created_at).toLocaleString()} &bull; {log.entity_type}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/artworks">Moderate Artworks ({pendingArtworksCount || 0})</Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/exhibitions">Manage Exhibitions</Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/cms">Edit Homepage CMS</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
