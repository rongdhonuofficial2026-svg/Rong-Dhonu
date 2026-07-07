'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCatalog(data: any) {
  const supabase = await createClient()

  // Verify auth and admin role
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  // Check if exhibition already has a catalog
  const { data: existing } = await supabase
    .from('catalogs')
    .select('id')
    .eq('exhibition_id', data.exhibition_id)
    .single()

  if (existing) {
    return { success: false, message: 'This exhibition already has an official catalog.' }
  }

  const { data: newCatalog, error } = await supabase
    .from('catalogs')
    .insert([
      {
        exhibition_id: data.exhibition_id,
        title_en: data.title_en,
        title_bn: data.title_bn,
        description_en: data.description_en,
        description_bn: data.description_bn,
        pdf_url: data.pdf_url,
        language: data.language || 'bilingual',
        version: data.version || '1.0',
        file_size: data.file_size,
        status: data.status || 'draft',
        published_at: data.status === 'published' ? new Date().toISOString() : null,
      }
    ])
    .select()
    .single()

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/admin/catalogs')
  revalidatePath('/catalogs')
  revalidatePath(`/exhibitions/${data.exhibition_id}`)

  return { success: true, data: newCatalog }
}

export async function updateCatalog(id: string, data: any) {
  const supabase = await createClient()

  // Verify auth and admin role
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  // Extract old PDF url if we need to replace it
  const { data: currentCatalog } = await supabase
    .from('catalogs')
    .select('pdf_url')
    .eq('id', id)
    .single()

  const { data: updatedCatalog, error } = await supabase
    .from('catalogs')
    .update({
      title_en: data.title_en,
      title_bn: data.title_bn,
      description_en: data.description_en,
      description_bn: data.description_bn,
      pdf_url: data.pdf_url,
      language: data.language,
      version: data.version,
      file_size: data.file_size,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { success: false, message: error.message }
  }

  // Cleanup old PDF from storage if replaced
  if (currentCatalog?.pdf_url && data.pdf_url && currentCatalog.pdf_url !== data.pdf_url) {
    const oldFileName = currentCatalog.pdf_url.split('/').pop()
    if (oldFileName) {
      await supabase.storage.from('catalogs').remove([oldFileName])
    }
  }

  revalidatePath('/admin/catalogs')
  revalidatePath('/catalogs')
  revalidatePath(`/exhibitions/${updatedCatalog.exhibition_id}`)

  return { success: true, data: updatedCatalog }
}

export async function deleteCatalog(id: string) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const { data: catalog } = await supabase
    .from('catalogs')
    .select('pdf_url, exhibition_id')
    .eq('id', id)
    .single()

  if (!catalog) return { success: false, message: 'Not found' }

  const { error } = await supabase
    .from('catalogs')
    .delete()
    .eq('id', id)

  if (error) return { success: false, message: error.message }

  if (catalog.pdf_url) {
    const fileName = catalog.pdf_url.split('/').pop()
    if (fileName) {
      await supabase.storage.from('catalogs').remove([fileName])
    }
  }

  revalidatePath('/admin/catalogs')
  revalidatePath('/catalogs')
  revalidatePath(`/exhibitions/${catalog.exhibition_id}`)

  return { success: true }
}

export async function publishCatalog(id: string, publish: boolean) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { success: false, message: 'Unauthorized' }

  const status = publish ? 'published' : 'draft'
  const published_at = publish ? new Date().toISOString() : null

  const { data: catalog, error } = await supabase
    .from('catalogs')
    .update({ status, published_at })
    .eq('id', id)
    .select('exhibition_id')
    .single()

  if (error) return { success: false, message: error.message }

  revalidatePath('/admin/catalogs')
  revalidatePath('/catalogs')
  if (catalog?.exhibition_id) {
    revalidatePath(`/exhibitions/${catalog.exhibition_id}`)
  }

  return { success: true }
}

export async function incrementDownloadCount(id: string) {
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const { trackExhibitionMetric } = await import('@/lib/analytics');
  
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data: catalog } = await supabaseAdmin
    .from('catalogs')
    .select('total_downloads, exhibition_id')
    .eq('id', id)
    .single()

  if (catalog) {
    await supabaseAdmin
      .from('catalogs')
      .update({ total_downloads: (catalog.total_downloads || 0) + 1 })
      .eq('id', id)
      
    if (catalog.exhibition_id) {
      await trackExhibitionMetric(catalog.exhibition_id, 'catalog_downloads_count')
    }
    return { success: true }
  }

  return { success: false }
}
