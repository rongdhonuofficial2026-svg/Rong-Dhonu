import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runTests() {
  console.log('--- STARTING CUSTOM GALLERY UPLOAD BACKEND VERIFICATION PIPELINE ---\n')
  
  const createdRecordIds: string[] = []
  const createdExhibitionIds: string[] = []
  const uploadedFiles: string[] = []

  try {
    // 1. Fetch available categories
    console.log('[1] Fetching categories...')
    const { data: categories, error: catError } = await supabase
      .from('gallery_categories')
      .select('*')
    if (catError) throw new Error(`Category fetch failed: ${catError.message}`)
    console.log(`✅ Fetched ${categories.length} categories. Sample slug: "${categories[0]?.slug}"`)

    // Verify 'visitors' category exists
    const hasVisitors = categories.some(c => c.slug === 'visitors')
    if (!hasVisitors) throw new Error('Seeded category "visitors" is missing!')
    console.log('✅ Required category "visitors" is present')

    // 2. Fetch or create exhibitions for different lifecycle states
    console.log('\n[2] Checking/creating mock exhibitions for lifecycle states...')
    
    // Ongoing exhibition check/create
    const { data: ongoingExs } = await supabase.from('exhibitions').select('id').eq('status', 'ongoing').limit(1)
    let ongoingId = ongoingExs?.[0]?.id
    if (!ongoingId) {
      console.log('Creating temporary Ongoing Exhibition...')
      const { data: newEx, error } = await supabase.from('exhibitions').insert({
        theme_en: 'Test Ongoing Exhibition',
        theme_bn: 'টেস্ট অনগোয়িং প্রদর্শনী',
        status: 'ongoing',
        exhibition_start: new Date().toISOString(),
        year: 2040
      }).select().single()
      if (error) throw new Error(`Failed to create ongoing exhibition: ${error.message}`)
      ongoingId = newEx.id
      createdExhibitionIds.push(newEx.id)
    }
    console.log(`✅ Ongoing exhibition verified: ID ${ongoingId}`)

    // Archived exhibition check/create
    const { data: archivedExs } = await supabase.from('exhibitions').select('id').eq('status', 'archived').limit(1)
    let archivedId = archivedExs?.[0]?.id
    if (!archivedId) {
      console.log('Creating temporary Archived Exhibition...')
      const { data: newEx, error } = await supabase.from('exhibitions').insert({
        theme_en: 'Test Archived Exhibition',
        theme_bn: 'টেস্ট আর্কাইভড প্রদর্শনী',
        status: 'archived',
        exhibition_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        exhibition_end: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        year: 2039
      }).select().single()
      if (error) throw new Error(`Failed to create archived exhibition: ${error.message}`)
      archivedId = newEx.id
      createdExhibitionIds.push(newEx.id)
    }
    console.log(`✅ Archived exhibition verified: ID ${archivedId}`)

    // 3. Test Storage upload
    console.log('\n[3] Testing Storage Upload to nested directories...')
    const testBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')
    const imgName = `images/test-custom-${Date.now()}.png`
    const vidName = `videos/test-custom-${Date.now()}.mp4`

    const { error: imgUploadError } = await supabase.storage
      .from('gallery')
      .upload(imgName, testBuffer, { contentType: 'image/png' })
    if (imgUploadError) throw new Error(`Image storage upload failed: ${imgUploadError.message}`)
    uploadedFiles.push(imgName)
    console.log('✅ Image uploaded to images/ folder successfully')

    const { error: vidUploadError } = await supabase.storage
      .from('gallery')
      .upload(vidName, testBuffer, { contentType: 'video/mp4' })
    if (vidUploadError) throw new Error(`Video storage upload failed: ${vidUploadError.message}`)
    uploadedFiles.push(vidName)
    console.log('✅ Video uploaded to videos/ folder successfully')

    const { data: { publicUrl: imgUrl } } = supabase.storage.from('gallery').getPublicUrl(imgName)
    const { data: { publicUrl: vidUrl } } = supabase.storage.from('gallery').getPublicUrl(vidName)

    // 4. Test DB Insert: Option B - Independent Gallery Media (No Exhibition)
    console.log('\n[4] Testing Database Insert: Option B - Independent Gallery Media (exhibition_id = null)...')
    const { data: record1, error: dbErr1 } = await supabase
      .from('gallery_media')
      .insert({
        url: imgUrl,
        media_type: 'image',
        category: 'visitors',
        title_en: 'E2E Independent Image Test',
        title_bn: 'বাংলা স্বাধীন ইমেজ টেস্ট',
        description_en: 'Test description english',
        description_bn: 'টেস্ট বিবরণ বাংলা',
        alt_text: 'Alt image text',
        photographer: 'Rongdhono Photographer',
        visibility: 'public',
        status: 'published',
        exhibition_id: null
      })
      .select()
      .single()

    if (dbErr1) throw new Error(`Independent DB Insert Failed: ${dbErr1.message}`)
    createdRecordIds.push(record1.id)
    console.log(`✅ DB record inserted without exhibition_id. ID: ${record1.id}`)

    // 5. Test DB Insert: Option A - Associate with Exhibition
    console.log('\n[5] Testing Database Insert: Option A - Associated with Exhibition...')
    const { data: record2, error: dbErr2 } = await supabase
      .from('gallery_media')
      .insert({
        url: vidUrl,
        media_type: 'video',
        category: 'opening_ceremony',
        title_en: 'E2E Associated Video Test',
        videographer: 'Rongdhono Videographer',
        copyright: 'Copyright 2026 Rongdhono',
        visibility: 'public',
        status: 'published',
        exhibition_id: ongoingId
      })
      .select()
      .single()

    if (dbErr2) throw new Error(`Associated DB Insert Failed: ${dbErr2.message}`)
    createdRecordIds.push(record2.id)
    console.log(`✅ DB record inserted with exhibition_id. ID: ${record2.id}`)

    // 6. Test DB Insert: Hidden/Private item status mapping
    console.log('\n[6] Testing Database Insert: Hidden visibility (status = draft)...')
    const { data: record3, error: dbErr3 } = await supabase
      .from('gallery_media')
      .insert({
        url: imgUrl,
        media_type: 'image',
        category: 'behind_the_scenes',
        title_en: 'E2E Hidden Image Test',
        visibility: 'hidden',
        status: 'draft',
        exhibition_id: archivedId
      })
      .select()
      .single()

    if (dbErr3) throw new Error(`Hidden DB Insert Failed: ${dbErr3.message}`)
    createdRecordIds.push(record3.id)
    console.log(`✅ DB record inserted with visibility=hidden. ID: ${record3.id}`)

    // 6.5 Verify column aliases backfill and triggers
    console.log('\n[6.5] Verifying database column aliases and trigger sync...')
    const { data: aliasCheck, error: aliasCheckErr } = await supabase
      .from('gallery_media')
      .select('id, url, public_url, is_featured, featured, uploaded_by, created_by, visibility')
      .in('id', createdRecordIds)

    if (aliasCheckErr) throw new Error(`Alias verification query failed: ${aliasCheckErr.message}`)
    
    for (const r of aliasCheck) {
      if (r.url !== r.public_url) {
        throw new Error(`Alias Mismatch: url "${r.url}" does not match public_url "${r.public_url}" for ID ${r.id}`)
      }
      if (!!r.is_featured !== !!r.featured) {
        throw new Error(`Alias Mismatch: is_featured "${r.is_featured}" does not match featured "${r.featured}" for ID ${r.id}`)
      }
      // Note: uploaded_by can be null if not logged in, but we check match
      if (r.uploaded_by !== r.created_by) {
        throw new Error(`Alias Mismatch: uploaded_by "${r.uploaded_by}" does not match created_by "${r.created_by}" for ID ${r.id}`)
      }
      console.log(`  - Record ${r.id}: url === public_url, is_featured === featured, uploaded_by === created_by (Visibility: ${r.visibility})`)
    }
    console.log('✅ Column aliases and sync triggers verified successfully!')

    // 7. Verify RLS Policy restrictions on select
    console.log('\n[7] Verifying RLS Policy: fetching anonymously...')
    // Create anonymous client
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: publicFetch, error: publicFetchErr } = await anonClient
      .from('gallery_media')
      .select('id, title_en, visibility')
      .in('id', createdRecordIds)

    if (publicFetchErr) throw new Error(`Public fetch failed: ${publicFetchErr.message}`)
    console.log(`Public fetched ${publicFetch.length} records:`, publicFetch)

    const hasHidden = publicFetch.some(r => r.visibility === 'hidden' || r.id === record3.id)
    if (hasHidden) {
      throw new Error('RLS Failure: Anonymous user was able to fetch a hidden gallery media item!')
    }
    console.log('✅ RLS Success: Anonymous users cannot fetch hidden assets')

    // 8. Clean up created mock data
    console.log('\n[8] Cleaning up test records and uploaded files...')
    
    // DB delete gallery media
    const { error: delErr } = await supabase
      .from('gallery_media')
      .delete()
      .in('id', createdRecordIds)
    if (delErr) console.warn('Failed to delete test media records:', delErr.message)
    else console.log('✅ Mock gallery_media records deleted')

    // DB delete test exhibitions
    if (createdExhibitionIds.length > 0) {
      const { error: delExErr } = await supabase
        .from('exhibitions')
        .delete()
        .in('id', createdExhibitionIds)
      if (delExErr) console.warn('Failed to delete test exhibitions:', delExErr.message)
      else console.log('✅ Mock exhibitions deleted')
    }

    // Storage remove files
    const { error: storeDelErr } = await supabase.storage
      .from('gallery')
      .remove(uploadedFiles)
    if (storeDelErr) console.warn('Failed to delete storage files:', storeDelErr.message)
    else console.log('✅ Uploaded test files deleted from storage')

    console.log('\n--- ALL CUSTOM GALLERY BACKEND TESTS PASSED ---')

  } catch (err: any) {
    console.error('\n❌ PIPELINE TEST FAILED:', err.message)
    
    // Cleanup on failure
    if (createdRecordIds.length > 0) {
      await supabase.from('gallery_media').delete().in('id', createdRecordIds)
    }
    if (createdExhibitionIds.length > 0) {
      await supabase.from('exhibitions').delete().in('id', createdExhibitionIds)
    }
    if (uploadedFiles.length > 0) {
      await supabase.storage.from('gallery').remove(uploadedFiles)
    }
    process.exit(1)
  }
}

runTests()
