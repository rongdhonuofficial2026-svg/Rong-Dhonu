import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data } = await supabase.from('cms_content')
    .select('id, field_key, value_en')
    .eq('field_key', 'imageUrl');
  console.log(JSON.stringify(data, null, 2));
}
main();
