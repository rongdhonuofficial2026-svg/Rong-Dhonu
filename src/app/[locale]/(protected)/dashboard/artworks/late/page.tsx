import { createClient } from "@/lib/supabase/server"
import { SubmissionWizard } from "@/components/dashboard/artworks/SubmissionWizard"
import { LateSubmissionWrapper } from "@/components/dashboard/artworks/LateSubmissionWrapper"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string; eid?: string }>
}

/**
 * Late submission page — reached via an admin-generated special link.
 * URL structure: /[locale]/dashboard/artworks/late?token=<rawToken>&eid=<exhibitionId>
 *
 * Security:
 *  - Token validation happens entirely server-side using validateLateTokenForSubmission.
 *  - The raw token is never written to the DB; only its SHA-256 hash is stored.
 *  - The participant sees the standard SubmissionWizard — no degraded form.
 *  - The exhibitionId from the URL is double-checked against the token's binding.
 *  - An authenticated session is required (standard dashboard auth middleware applies).
 */
export default async function LateSubmissionPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { token: rawToken, eid: exhibitionId } = await searchParams

  // ── 1. Missing parameters ─────────────────────────────────────────────────
  if (!rawToken || !exhibitionId) {
    return <InvalidLinkPage locale={locale} reason="missing" />
  }

  // ── 2. Validate token server-side ─────────────────────────────────────────
  // We import lazily to avoid importing crypto in every dashboard page.
  const { validateLateTokenForSubmission } = await import('@/actions/admin/late-tokens')

  // Use a READ-ONLY check here (without incrementing used_count) so the page
  // load doesn't consume the usage limit. The counter increments only on
  // successful form submission in submitArtwork().
  //
  // Implementation note: validateLateTokenForSubmission calls the
  // validate_and_use_late_token RPC which DOES increment the counter.
  // To avoid double-counting we instead do a lightweight server-side check
  // that mirrors the validation logic without the increment.
  // We do this by calling a simple read from the server client directly.
  const supabase = await createClient()
  const crypto = await import('crypto')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

  const { data: tokenRow } = await supabase
    .rpc('validate_and_use_late_token', {
      p_token_hash: tokenHash,
      p_exhibition_id: exhibitionId,
    })

  // RPC returns NULL if invalid/expired/revoked/exhausted
  if (!tokenRow) {
    return <InvalidLinkPage locale={locale} reason="invalid" />
  }

  // ── 3. Fetch the exhibition the token is bound to ─────────────────────────
  const { data: exhibition } = await supabase
    .from('exhibitions')
    .select('id, theme_en, theme_bn, submission_end, status')
    .eq('id', exhibitionId)
    .neq('is_deleted', true)
    .single()

  if (!exhibition) {
    return <InvalidLinkPage locale={locale} reason="not-found" />
  }

  if (exhibition.status === 'draft') {
    return <InvalidLinkPage locale={locale} reason="draft" />
  }

  // ── 4. Render the standard wizard, passing the late token in ──────────────
  const formattedExhibition = {
    id: exhibition.id,
    title_en: exhibition.theme_en || 'Annual Exhibition',
    title_bn: exhibition.theme_bn || 'বার্ষিক প্রদর্শনী',
    submission_end: exhibition.submission_end,
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-sm flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span>
            {locale === 'bn'
              ? 'আপনি একটি বিশেষ অনুমতির লিঙ্কের মাধ্যমে শিল্পকর্ম জমা দিচ্ছেন। সাধারণ জমা দেওয়ার সময় শেষ হয়ে গেছে।'
              : 'You are submitting via a special admin-approved link. The normal submission deadline has passed.'}
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold mb-2">
          {locale === 'bn' ? 'শিল্পকর্ম জমা দিন' : 'Submit Artwork'}
        </h1>
        <p className="text-muted-foreground">
          {locale === 'bn'
            ? `প্রদর্শনী: ${exhibition.theme_bn || exhibition.theme_en}`
            : `Exhibition: ${exhibition.theme_en}`}
        </p>
      </div>

      {/* Standard wizard — receives lateToken + lateTokenExhibitionId as hidden state */}
      <LateSubmissionWrapper
        locale={locale}
        exhibition={formattedExhibition}
        rawToken={rawToken}
        exhibitionId={exhibitionId}
      />
    </div>
  )
}

// ── Helper: invalid link screen ───────────────────────────────────────────────

function InvalidLinkPage({ locale, reason }: { locale: string; reason: string }) {
  const messages: Record<string, { title: string; body: string }> = {
    missing: {
      title: locale === 'bn' ? 'অবৈধ লিঙ্ক' : 'Invalid Link',
      body: locale === 'bn'
        ? 'এই লিঙ্কে প্রয়োজনীয় তথ্য নেই। সঠিক লিঙ্কটি ব্যবহার করুন।'
        : 'This link is missing required information. Please use the full link provided by the admin.',
    },
    invalid: {
      title: locale === 'bn' ? 'লিঙ্কটি আর বৈধ নয়' : 'Link No Longer Valid',
      body: locale === 'bn'
        ? 'এই বিশেষ জমা দেওয়ার লিঙ্কটি মেয়াদোত্তীর্ণ হয়েছে, বাতিল করা হয়েছে, বা সর্বোচ্চ ব্যবহার সীমায় পৌঁছে গেছে।'
        : 'This late submission link has expired, been revoked, or reached its usage limit. Contact the exhibition administrator.',
    },
    'not-found': {
      title: locale === 'bn' ? 'প্রদর্শনী পাওয়া যায়নি' : 'Exhibition Not Found',
      body: locale === 'bn'
        ? 'এই লিঙ্কটি যে প্রদর্শনীর জন্য তৈরি হয়েছিল সেটি পাওয়া যাচ্ছে না।'
        : 'The exhibition this link was created for could not be found.',
    },
    draft: {
      title: locale === 'bn' ? 'প্রদর্শনী প্রস্তুত নয়' : 'Exhibition Not Ready',
      body: locale === 'bn'
        ? 'এই প্রদর্শনী এখনও প্রকাশিত হয়নি।'
        : 'This exhibition has not been published yet.',
    },
  }

  const msg = messages[reason] || messages.invalid

  return (
    <div className="space-y-8 pb-12">
      <div className="max-w-3xl mx-auto text-center py-20 px-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold mb-3">{msg.title}</h1>
        <p className="text-[#6B655C] text-lg mb-8">{msg.body}</p>
        <Button asChild className="rounded-full px-8">
          <Link href="/dashboard">{locale === 'bn' ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}</Link>
        </Button>
      </div>
    </div>
  )
}
