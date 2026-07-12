import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: pageData } = await supabase.from('cms_pages').select('id').eq('slug', 'home').single();
  if (!pageData) return console.error('No home page');

  const { data: sectionData } = await supabase.from('cms_sections').select('id').eq('page_id', pageData.id).eq('section_key', 'hero').single();
  if (!sectionData) return console.error('No hero section');

  const { error } = await supabase.from('cms_content')
    .update({ value_en: '/images/home/hero_bg_new.jpg', value_bn: '/images/home/hero_bg_new.jpg' })
    .eq('section_id', sectionData.id)
    .eq('field_key', 'imageUrl');

  if (error) console.error(error);
  else console.log('Successfully updated hero image URL');
}
main();
