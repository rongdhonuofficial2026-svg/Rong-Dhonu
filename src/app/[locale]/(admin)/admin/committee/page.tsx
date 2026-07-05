import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Edit, Trash, Plus, GripVertical } from "lucide-react"
import Image from "next/image"

export default async function CommitteeManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  // Fetch committee members with their profiles
  const { data: members, error } = await supabase
    .from('committee_members')
    .select('*, profiles(*), exhibitions(year, title_en)')
    .order('created_at', { ascending: true })

  if (error) {
    return <div className="p-8 text-destructive">Error loading committee: {error.message}</div>
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">Committee Management</h1>
          <p className="text-muted-foreground">Manage the active committee members and assign roles.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Committee Members</CardTitle>
          <CardDescription>Drag and drop to reorder members. (Visual demonstration)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {!members || members.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No committee members found.</p>
            ) : (
              members.map((member: any) => (
                <div key={member.id} className="flex items-center gap-4 p-4 border border-border rounded-xl bg-card hover:bg-muted/30 transition-colors group">
                  <div className="cursor-grab text-muted-foreground hover:text-foreground">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
                    {member.profiles?.avatar_url ? (
                      <Image src={member.profiles.avatar_url} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground">
                        {member.profiles?.first_name_en?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg truncate">
                      {member.profiles?.first_name_en} {member.profiles?.last_name_en}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span className="font-medium text-accent">{member.role_title_en}</span>
                      <span>&bull;</span>
                      <span>Exhibition {member.exhibitions?.year || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10 border-destructive/20">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
