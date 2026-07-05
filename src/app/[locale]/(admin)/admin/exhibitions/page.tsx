import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/routing"
import { Plus, Edit, Copy, Archive, MoreHorizontal, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ExhibitionActions } from "@/components/admin/ExhibitionActions"

export default async function ExhibitionsManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: exhibitions, error } = await supabase
    .from('exhibitions')
    .select('*')
    .order('start_date', { ascending: false })

  if (error) {
    return <div className="p-8 text-destructive">Error loading exhibitions: {error.message}</div>
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">Exhibitions Management</h1>
          <p className="text-muted-foreground">Create, edit, duplicate, and archive exhibitions.</p>
        </div>
        <Button asChild>
          <Link href="/admin/exhibitions/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Exhibition
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!exhibitions || exhibitions.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-dashed rounded-xl">
            <p className="text-muted-foreground">No exhibitions found.</p>
          </div>
        ) : (
          exhibitions.map((ex) => (
            <Card key={ex.id} className={`flex flex-col ${ex.status === 'archived' ? 'opacity-60' : ''}`}>
              <div 
                className="h-32 bg-muted relative rounded-t-xl bg-cover bg-center border-b border-border"
                style={{ backgroundImage: ex.hero_image_url ? `url(${ex.hero_image_url})` : 'none' }}
              >
                <div className="absolute top-4 right-4">
                  <Badge variant={
                    ex.status === 'active' ? 'default' : 
                    ex.status === 'upcoming' ? 'secondary' : 
                    ex.status === 'draft' ? 'outline' : 'destructive'
                  }>
                    {ex.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-xl line-clamp-1">{ex.title_en}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {ex.start_date ? new Date(ex.start_date).toLocaleDateString() : 'TBD'} 
                  {ex.end_date ? ` - ${new Date(ex.end_date).toLocaleDateString()}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex gap-2 pt-4 border-t border-border bg-muted/10">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/admin/exhibitions/${ex.id}`}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Link>
                </Button>
                <ExhibitionActions id={ex.id} locale={locale} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
