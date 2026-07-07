require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('catalogs').select('*').order('created_at', { ascending: false });
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Success, data:', data);
  }
}
test();
