'use server'

import { createClient } from "@/lib/supabase/server"

export type SearchResultItem = {
  id: string
  type: 'artwork' | 'artist' | 'exhibition'
  title: string
  subtitle?: string
  image_url?: string
  href: string
}

export async function globalSearch(query: string, locale: string = 'en'): Promise<SearchResultItem[]> {
  if (!query || query.trim().length < 2) return []

  const supabase = await createClient()
  const q = `%${query.trim()}%`

  // Execute parallel queries across main entities
  const [artworksRes, profilesRes, exhibitionsRes] = await Promise.all([
    // Search approved artworks
    supabase
      .from('artworks')
      .select('id, title_en, title_bn, category, main_image_url, profiles(first_name_en, last_name_en)')
      .eq('status', 'approved')
      .or(`title_en.ilike.${q},title_bn.ilike.${q},description_en.ilike.${q}`)
      .limit(5),
    
    // Search members / artists
    supabase
      .from('profiles')
      .select('id, first_name_en, last_name_en, full_name_bn, role, avatar_url')
      .in('role', ['member', 'committee', 'admin'])
      .or(`first_name_en.ilike.${q},last_name_en.ilike.${q},full_name_bn.ilike.${q}`)
      .limit(5),
      
    // Search exhibitions
    supabase
      .from('exhibitions')
      .select('id, theme_en, theme_bn, year, hero_image_url')
      .neq('is_deleted', true)
      .or(`theme_en.ilike.${q},theme_bn.ilike.${q},description_en.ilike.${q}`)
      .limit(3)
  ])

  const results: SearchResultItem[] = []

  if (artworksRes.data) {
    artworksRes.data.forEach((item: Record<string, unknown>) => {
      const artistName = item.profiles ? `${(item.profiles as any).first_name_en} ${(item.profiles as any).last_name_en}` : 'Unknown Artist'
      results.push({
        id: item.id as string,
        type: 'artwork',
        title: locale === 'bn' && item.title_bn ? item.title_bn as string : item.title_en as string,
        subtitle: artistName,
        image_url: item.main_image_url as string,
        href: `/${locale}/gallery/${item.id}`
      })
    })
  }

  if (profilesRes.data) {
    profilesRes.data.forEach((item: Record<string, unknown>) => {
      const name = locale === 'bn' && item.full_name_bn ? item.full_name_bn as string : `${item.first_name_en} ${item.last_name_en}`
      results.push({
        id: item.id as string,
        type: 'artist',
        title: name,
        subtitle: (item.role as string).charAt(0).toUpperCase() + (item.role as string).slice(1),
        image_url: item.avatar_url as string,
        href: `/${locale}/artists/${item.id}`
      })
    })
  }

  if (exhibitionsRes.data) {
    exhibitionsRes.data.forEach((item: Record<string, unknown>) => {
      results.push({
        id: item.id as string,
        type: 'exhibition',
        title: locale === 'bn' && item.theme_bn ? item.theme_bn as string : item.theme_en as string,
        subtitle: `Exhibition ${item.year}`,
        image_url: item.hero_image_url as string,
        href: `/${locale}/exhibitions/${item.id}`
      })
    })
  }

  return results
}
