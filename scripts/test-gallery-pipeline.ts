import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runTests() {
  console.log('--- STARTING GALLERY MEDIA END-TO-END ACCEPTANCE TEST ---\n')
  
  let recordId = ''
  let storageUrl = ''

  try {
    // 1. Upload Media
    console.log('[1] Testing Storage Upload...')
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')
    const fileName = `test-e2e-${Date.now()}.png`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(fileName, testImageBuffer, {
        contentType: 'image/png'
      })

    if (uploadError) throw new Error(`Upload Failed: ${uploadError.message}`)
    console.log('✅ Upload Successful')
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName)
    storageUrl = publicUrl
    console.log(`✅ Storage URL generated: ${storageUrl}`)

    // 2. Create Database Record
    console.log('\n[2] Testing Database Record Creation...')
    // We need an admin user id, let's just get the first user in auth.users
    const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1 })
    const userId = users.users[0]?.id

    if (!userId) throw new Error('No user found to assign as uploader')

    const { data: record, error: dbError } = await supabase
      .from('gallery_media')
      .insert({
        url: storageUrl,
        media_type: 'image',
        category: 'artwork',
        title_en: 'E2E Test Image',
        title_bn: 'ইটুি টেস্ট ইমেজ',
        description_en: 'Testing description',
        status: 'draft',
        uploaded_by: userId
      })
      .select()
      .single()

    if (dbError) throw new Error(`DB Insert Failed: ${dbError.message}`)
    recordId = record.id
    console.log('✅ DB Record Created Successfully')
    
    // 3. Metadata Verification
    console.log('\n[3] Testing Metadata Persistence...')
    const { data: fetchRecord, error: fetchError } = await supabase
      .from('gallery_media')
      .select('*')
      .eq('id', recordId)
      .single()

    if (fetchError) throw new Error(`Fetch Failed: ${fetchError.message}`)
    if (fetchRecord.title_en !== 'E2E Test Image' || fetchRecord.status !== 'draft') {
      throw new Error(`Metadata mismatch: ${JSON.stringify(fetchRecord)}`)
    }
    console.log('✅ Metadata persisted correctly')

    // 4. Update Status (Publish)
    console.log('\n[4] Testing Status Update (Publish)...')
    const { error: updateError } = await supabase
      .from('gallery_media')
      .update({ status: 'published' })
      .eq('id', recordId)

    if (updateError) throw new Error(`Update Failed: ${updateError.message}`)
    console.log('✅ Record Published')

    // 5. Delete and Cleanup
    console.log('\n[5] Testing Deletion and Storage Cleanup...')
    const { error: deleteError } = await supabase
      .from('gallery_media')
      .delete()
      .eq('id', recordId)

    if (deleteError) throw new Error(`Delete Failed: ${deleteError.message}`)
    
    const { error: storageDelError } = await supabase.storage
      .from('gallery')
      .remove([fileName])

    if (storageDelError) throw new Error(`Storage Delete Failed: ${storageDelError.message}`)
    console.log('✅ DB Record and Storage File Deleted Successfully')

    console.log('\n--- ALL E2E TESTS PASSED SUCCESSFULLY ---')

  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message)
    // Cleanup if failed
    if (recordId) {
      console.log('Attempting DB cleanup...')
      await supabase.from('gallery_media').delete().eq('id', recordId)
    }
    if (storageUrl) {
      console.log('Attempting Storage cleanup...')
      const urlObj = new URL(storageUrl)
      const pathParts = urlObj.pathname.split('/gallery/')
      if (pathParts.length === 2) {
         await supabase.storage.from('gallery').remove([pathParts[1]])
      }
    }
    process.exit(1)
  }
}

runTests()
