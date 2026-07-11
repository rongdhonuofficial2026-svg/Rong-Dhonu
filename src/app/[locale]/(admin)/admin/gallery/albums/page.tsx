import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { FolderHeart, ArrowLeft } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"
import { AlbumManager } from "@/components/admin/gallery/AlbumManager"

export const metadata = {
  title: "Gallery Albums — Rongdhonu Admin",
}

export default async function GalleryAlbumsPage({ params }: { params: Promise<{ locale: string }> }) {
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

  // 2. Fetch categories for independent album creations
  const { data: categories } = await supabase
    .from('gallery_categories')
    .select('id, slug, name_en')
    .order('sort_order', { ascending: true })

  // 3. Fetch albums with nested gallery_media for dynamic client-side stats
  const { data: albums, error: albErr } = await supabase
    .from('gallery_albums')
    .select(`
      *,
      gallery_media:gallery_media!gallery_media_gallery_album_id_fkey (
        id,
        media_type,
        url,
        size_bytes,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (albErr) {
    return <div className="p-8 text-destructive">Error loading gallery albums: {albErr.message}</div>
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Breadcrumbs & Header */}
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
            <span className="text-accent">Albums Management</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight flex items-center gap-3">
            <FolderHeart className="w-6 h-6 text-accent shrink-0" />
            Albums Management
          </h1>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
            Create, edit, and organize media collections. Set cover overrides, manage visibility, configure SEO attributes, and track usage statistics.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-accent/30 via-border/60 to-transparent" />

      {/* Album Manager component */}
      <AlbumManager 
        initialAlbums={(albums || []) as any} 
        categories={categories || []} 
      />
    </div>
  )
}
