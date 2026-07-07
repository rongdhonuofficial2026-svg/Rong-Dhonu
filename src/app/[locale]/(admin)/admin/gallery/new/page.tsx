import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ArrowLeft, ImageIcon } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"
import { CustomGalleryUploader } from "@/components/admin/gallery/CustomGalleryUploader"

export const metadata = {
  title: "Upload Gallery Media — Rongdhono Admin",
}

export default async function NewGalleryMediaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  // 1. Authorization check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    notFound()
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'owner' && profile.role !== 'committee')) {
    notFound()
  }

  // 2. Fetch categories
  const { data: categories } = await supabase
    .from('gallery_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  // 3. Fetch exhibitions
  const { data: exhibitions } = await supabase
    .from('exhibitions')
    .select('id, theme_en, theme_bn, year, status')
    .neq('is_deleted', true)
    .order('year', { ascending: false })
    .order('exhibition_start', { ascending: false })

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24">
      {/* Breadcrumb & Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild className="mt-1 shrink-0">
          <Link href="/admin/gallery">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <Link href="/admin/gallery" className="hover:text-accent transition-colors">Gallery</Link>
            <span>&gt;</span>
            <span className="text-accent">Upload Media</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-accent shrink-0" />
            Upload Gallery Media
          </h1>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
            Upload photographs or videos directly into the Rongdhono media archive. Associate them with an exhibition or store them independently for future use.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-accent/30 via-border/60 to-transparent" />

      {/* Upload Form Component */}
      <CustomGalleryUploader 
        locale={locale} 
        categories={categories || []} 
        exhibitions={exhibitions || []} 
      />
    </div>
  )
}
