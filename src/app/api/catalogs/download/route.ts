import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// RFC 4122 UUID v4 regex — prevents SQL injection and open redirect via ID param
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const catalogId = searchParams.get('id')

  // 1. Validate presence
  if (!catalogId) {
    return NextResponse.json({ error: 'Missing catalog ID' }, { status: 400 })
  }

  // 2. Validate UUID format — prevents injection attacks
  if (!UUID_REGEX.test(catalogId)) {
    return NextResponse.json({ error: 'Invalid catalog ID format' }, { status: 400 })
  }

  const supabase = await createClient()

  // 3. Fetch only published catalog
  const { data: catalog, error } = await supabase
    .from('catalogs')
    .select('id, pdf_url, title_en, status, visibility')
    .eq('id', catalogId)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .single()

  if (error || !catalog) {
    return NextResponse.json(
      { error: 'Catalog not found or not published' },
      { status: 404 }
    )
  }

  // 4. Validate the PDF URL is from our Supabase storage — prevents open redirect
  const allowedHosts = [
    process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null,
  ].filter(Boolean)

  let pdfUrl: URL
  try {
    pdfUrl = new URL(catalog.pdf_url)
  } catch {
    return NextResponse.json({ error: 'Invalid catalog URL' }, { status: 500 })
  }

  const isAllowed =
    allowedHosts.length === 0 || // Allow all in dev if no env var set
    allowedHosts.some(
      (host) => pdfUrl.hostname === host || pdfUrl.hostname.endsWith(`.${host}`)
    )

  if (!isAllowed) {
    console.warn(`[Security] Blocked redirect to unauthorized host: ${pdfUrl.hostname}`)
    return NextResponse.json({ error: 'Invalid catalog URL' }, { status: 400 })
  }

  // 5. Extract analytics metadata
  const { data: { user } } = await supabase.auth.getUser()
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') || null
  const country = request.headers.get('x-vercel-ip-country') || null

  // 6. Log download analytics (fire-and-forget — do not block the redirect)
  supabase
    .rpc('increment_catalog_downloads', {
      catalog_id: catalogId,
      p_user_id: user?.id || null,
      p_ip: ipAddress,
      p_country: country
    })
    .then(({ error: rpcError }) => {
      if (rpcError) console.warn('[Analytics] Download log failed:', rpcError.message)
    })

  // 7. Safe redirect to validated PDF URL
  return NextResponse.redirect(catalog.pdf_url, { status: 302 })
}
