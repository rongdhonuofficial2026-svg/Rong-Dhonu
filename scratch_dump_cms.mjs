import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data: pages } = await supabase
    .from('cms_pages')
    .select(`
      slug,
      cms_sections (
        section_key,
        enabled,
        cms_content (
          field_key,
          field_type,
          value_en,
          value_bn
        )
      )
    `);
  fs.writeFileSync('cms_dump.json', JSON.stringify(pages, null, 2));
  console.log('Dumped to cms_dump.json');
}
main();
