import { createClient } from "@/lib/supabase/server"
import { ExhibitionForm } from "@/components/admin/ExhibitionForm"
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/exhibitions">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-3xl font-bold">Edit Exhibition</h1>
          <p className="text-muted-foreground">Updating: {exhibition.title_en}</p>
        </div>
      </div>

      <ExhibitionForm locale={locale} initialData={exhibition} />
    </div>
  )
}
