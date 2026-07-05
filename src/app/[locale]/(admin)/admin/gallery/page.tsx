import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Trash2, Edit2, PlayCircle } from "lucide-react"
import Image from "next/image"

export default async function GalleryManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  // Fetch gallery media
  const { data: media, error } = await supabase
    .from('gallery_media')
    .select('*, exhibitions(title_en)')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-destructive">Error loading gallery: {error.message}</div>
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">Gallery Management</h1>
          <p className="text-muted-foreground">Upload and organize event photos and videos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Manage Categories</Button>
          <Button>
            <Upload className="w-4 h-4 mr-2" /> Bulk Upload
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {!media || media.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
            No gallery media found.
          </div>
        ) : (
          media.map((item: any) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="relative aspect-square bg-muted">
                {item.media_type === 'image' ? (
                  <Image src={item.url} alt="Gallery item" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-white">
                    <PlayCircle className="w-12 h-12 opacity-50" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-white text-sm">
                    <p className="font-medium truncate">{item.caption_en || 'No caption'}</p>
                    <p className="text-white/70 text-xs truncate capitalize">{item.category}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
