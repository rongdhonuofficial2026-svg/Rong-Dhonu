import { ExhibitionForm } from "@/components/admin/ExhibitionForm"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "New Exhibition — Rongdhonu Admin",
}

export default async function NewExhibitionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild className="mt-1 shrink-0">
          <Link href="/admin/exhibitions">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-accent">New Exhibition</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-accent shrink-0" />
            Initialise Exhibition
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Define the exhibition&apos;s identity, timeline, and venue. After creation, the exhibition dashboard will let you manage catalogs, gallery, artist participation, and publication settings.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-accent/30 via-border/60 to-transparent" />

      {/* Form */}
      <ExhibitionForm locale={locale} />
    </div>
  )
}
