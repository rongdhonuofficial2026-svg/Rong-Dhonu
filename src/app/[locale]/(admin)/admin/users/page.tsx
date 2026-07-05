import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MoreVertical, Shield, Calendar, Image as ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default async function UserManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      *,
      artworks(id)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-destructive">Error loading users: {error.message}</div>
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage artists, committee members, and admins.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, or phone..." className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background" />
        </div>
        <Button variant="outline">Filter Role</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!users || users.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
            No users found.
          </div>
        ) : (
          users.map((user: any) => (
            <Card key={user.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-6 flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted shrink-0 border border-border">
                    {user.avatar_url ? (
                      <Image src={user.avatar_url} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xl text-muted-foreground">
                        {user.first_name_en?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg truncate flex items-center gap-2">
                          {user.first_name_en} {user.last_name_en}
                          {user.role === 'admin' && <Shield className="w-4 h-4 text-indigo-500" />}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{user.email || 'No email'}</p>
                      </div>
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'committee' ? 'secondary' : 'outline'} className="capitalize">
                        {user.role}
                      </Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4" />
                        <span className="font-medium text-foreground">{user.artworks?.length || 0}</span> Artworks
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        Joined {new Date(user.created_at).getFullYear()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-2">
                  <Button variant="outline" size="sm">View Profile</Button>
                  <Button variant="outline" size="sm">Change Role</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
