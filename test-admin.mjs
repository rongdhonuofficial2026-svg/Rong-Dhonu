import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321' // Replace with local or production URL if needed
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdminRoute() {
  console.log("Logging in...")
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@rongdhonuofficial.com',
    password: 'password'
  })
  
  if (error) {
    console.error("Login failed:", error.message)
    // We might not be able to log in to the remote DB if we don't have the real env vars.
    // Let's print the env vars to check.
    return
  }

  console.log("Logged in:", data.session.access_token)
  
  // Make a request with the auth cookie
  const res = await fetch('http://localhost:3000/en/admin/exhibitions', {
    headers: {
      Cookie: `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token=${JSON.stringify([data.session.access_token, data.session.refresh_token, null, null])}`
    }
  })
  
  const text = await res.text()
  console.log("Status:", res.status)
  if (text.includes('Something went wrong')) {
    console.error("ERROR BOUNDARY FOUND!")
  } else {
    console.log("Success! Page rendered.")
  }
}

testAdminRoute()
