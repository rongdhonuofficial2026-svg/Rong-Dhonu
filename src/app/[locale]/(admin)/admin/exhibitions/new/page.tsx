import { ExhibitionForm } from "@/components/admin/ExhibitionForm"
import { ArrowLeft } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

export default async function NewExhibitionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/exhibitions">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-3xl font-bold">Create New Exhibition</h1>
          <p className="text-muted-foreground">Setup dates, venues, and status for the new event.</p>
        </div>
      </div>

      <ExhibitionForm locale={locale} />
    </div>
  )
}
