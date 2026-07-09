import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const resendApiKey = Deno.env.get("RESEND_API_KEY")
const adminEmail = Deno.env.get("ADMIN_EMAIL") || "rongdhonuofficial2026@gmail.com"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html } = await req.json()

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY is not set. Simulating email send to:", to, subject)
      return new Response(JSON.stringify({ success: true, simulated: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 1. First attempt: try sending from official domain
    let fromEmail = 'Rongdhonu <noreply@rongdhonu.art>'
    let toEmail = to
    let subjectLine = subject

    let res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        subject: subjectLine,
        html
      })
    })

    let data = await res.json()

    // 2. Fallback attempt: if Resend returns a 403 unverified domain error, retry in sandbox mode
    if (res.status === 403 || (data && (data.statusCode === 403 || data.error))) {
      console.warn(`Resend email delivery failed (Status: ${res.status}). Attempting unverified domain sandbox fallback for recipient: ${to}`)
      fromEmail = 'onboarding@resend.dev'
      toEmail = adminEmail
      subjectLine = `[Rerouted Sandbox to ${to}] ${subject}`

      res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmail,
          subject: subjectLine,
          html
        })
      })
      data = await res.json()
    }

    // 3. Return the exact response with the correct HTTP status code
    if (res.status !== 200 || (data && data.error)) {
      console.error('Email sending failed:', data)
      return new Response(JSON.stringify({ success: false, error: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: res.status === 200 ? 400 : res.status,
      })
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Edge function caught exception:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
