import { createClient } from "@/lib/supabase/server"
import { ExhibitionForm } from "@/components/admin/ExhibitionForm"
import { GalleryUploader } from "@/components/admin/gallery/GalleryUploader"
import { ArrowLeft } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

export default async function EditExhibitionPage({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { locale, id } = await params
  const supabase = await createClient()

  const { data: exhibition, error } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !exhibition) {
    return <div className="p-8 text-destructive">Exhibition not found.</div>
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/exhibitions">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-3xl font-bold">Edit Exhibition</h1>
          <p className="text-muted-foreground">Updating: {exhibition.theme_en}</p>
        </div>
      </div>

      <ExhibitionForm locale={locale} initialData={exhibition} />

      <div className="mt-16 pt-12 border-t border-border/40">
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Exhibition Album Media</h2>
          <p className="text-muted-foreground">
            Upload photos and videos that belong to this exhibition. 
            All uploaded media will be displayed as a single memory album in the public gallery.
          </p>
        </div>
        <GalleryUploader exhibitionId={exhibition.id} />
      </div>
    </div>
  )
}
