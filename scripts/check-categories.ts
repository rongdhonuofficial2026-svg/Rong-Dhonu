import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
  console.log('Checking gallery_categories table...')
  const { data: cats, error: errCats } = await supabase.from('gallery_categories').select('*').limit(1)
  if (errCats) console.error('Cats error:', errCats)
  else console.log('Cats:', cats)

  console.log('Checking gallery_media category column...')
  const { data: media, error: errMedia } = await supabase.from('gallery_media').select('category, category_id').limit(1)
  if (errMedia) console.error('Media error:', errMedia)
  else console.log('Media columns:', Object.keys(media[0] || {}))
}

check()
