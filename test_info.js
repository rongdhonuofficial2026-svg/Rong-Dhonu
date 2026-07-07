require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCols() {
  const { data, error } = await supabase.rpc('get_catalogs_columns');
  // if rpc doesn't exist, we can query information_schema
  const { data: cols, error: err } = await supabase.from('catalogs').select('*').limit(0);
  if (err) console.log(err);
  // since this returns data: [], we can't see cols. Let's do a raw fetch if possible.
}
checkCols();
