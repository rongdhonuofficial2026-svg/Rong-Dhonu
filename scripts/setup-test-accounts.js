/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAccounts() {
  console.log('Setting up test accounts...');
  
  const accounts = [
    { email: 'admin@rongdhonu.art', password: 'TestPassword123!', name: 'System Admin', role: 'admin' },
    { email: 'committee@rongdhonu.art', password: 'TestPassword123!', name: 'Committee Member', role: 'committee' },
    { email: 'artist@rongdhonu.art', password: 'TestPassword123!', name: 'Test Artist', role: 'member' }
  ];

  for (const acc of accounts) {
    console.log(`Creating user: ${acc.email}`);
    
    // Check if user exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError);
      continue;
    }
    
    let user = users.users.find(u => u.email === acc.email);
    
    if (!user) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: { full_name: acc.name }
      });
      
      if (error) {
        console.error(`Error creating ${acc.email}:`, error);
        continue;
      }
      user = data.user;
      console.log(`Created user ${acc.email} with ID ${user.id}`);
    } else {
      console.log(`User ${acc.email} already exists.`);
    }

    // Since RLS is bypassed, we can update the profile role directly
    console.log(`Updating role for ${acc.email} to ${acc.role}...`);
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: acc.role, full_name_en: acc.name })
      .eq('id', user.id);
      
    if (profileError) {
      console.error(`Error updating profile for ${acc.email}:`, profileError);
    } else {
      console.log(`Profile updated successfully for ${acc.email}`);
    }
  }
  
  console.log('Setup complete.');
}

setupAccounts();
