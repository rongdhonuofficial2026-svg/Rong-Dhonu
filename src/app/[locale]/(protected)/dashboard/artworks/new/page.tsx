import { createClient } from "@/lib/supabase/server"
import { SubmissionWizard } from "@/components/dashboard/artworks/SubmissionWizard"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

export default async function NewArtworkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { getFeaturedExhibition } = await import("@/lib/exhibition-lifecycle")

  // Find the featured/upcoming/ongoing exhibition
  const exhibition = await getFeaturedExhibition()

  const now = new Date()

  /**
   * Submission window rule:
   *  - Opens at `registration_start`
   *  - Closes at end of day on the exhibition START date (`submission_end` field).
   *    i.e. if exhibition runs 9 Oct – 11 Oct, submission_end = "2026-10-09T23:59:59"
   *  - Once submission_end has passed, the form is HARD-BLOCKED (no bypass).
   */
  const isSubmissionOpen = (exh: any): boolean => {
    if (!exh) return false
    if (exh.status === 'draft' || exh.status === 'archived') return false
    // If registration hasn't started yet, not open
    if (exh.registration_start && now < new Date(exh.registration_start)) return false
    // If submission deadline has passed, CLOSED — no exceptions for members
    if (exh.submission_end && now > new Date(exh.submission_end)) return false
    return true
  }

  const submissionOpen = isSubmissionOpen(exhibition)

  // ── No exhibition at all ─────────────────────────────────────────────────
  if (!exhibition) {
    return (
      <div className="space-y-8 pb-12">
        <div className="max-w-3xl mx-auto text-center py-20">
          <h1 className="font-serif text-3xl font-bold mb-4">
            {locale === 'bn' ? "কোনো সক্রিয় প্রদর্শনী নেই" : "No Active Exhibition"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {locale === 'bn'
              ? "বর্তমানে কোনো প্রদর্শনী তৈরি হয়নি। পরবর্তী প্রদর্শনীর জন্য অপেক্ষা করুন।"
              : "There is no active exhibition at this time. Please wait for the next exhibition announcement."}
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">{locale === 'bn' ? "ড্যাশবোর্ডে যান" : "Back to Dashboard"}</Link>
          </Button>
        </div>
      </div>
    )
  }

  // ── Submission window is CLOSED — hard-block the form ────────────────────
  if (!submissionOpen) {
    const exhibitionName = exhibition.theme_en || 'Annual Exhibition'
    const exhibitionNameBn = exhibition.theme_bn || 'বার্ষিক প্রদর্শনী'

    // Format submission_end for display (e.g. "9 October 2026, 11:59 PM")
    let deadlineDisplay = ''
    if (exhibition.submission_end) {
      const d = new Date(exhibition.submission_end)
      deadlineDisplay = d.toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Dhaka',
      })
    }

    return (
      <div className="space-y-8 pb-12">
        <div className="max-w-3xl mx-auto text-center py-20 px-4">
          {/* Closed Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3 text-charcoal">
            {locale === 'bn' ? "জমা দেওয়ার সময় শেষ" : "Submission Closed"}
          </h1>

          <p className="text-lg font-medium text-[#6B655C] mb-2">
            {locale === 'bn'
              ? `"${exhibitionNameBn}" প্রদর্শনীর জন্য শিল্পকর্ম জমা দেওয়ার সময়সীমা শেষ হয়ে গেছে।`
              : `The artwork submission window for "${exhibitionName}" has closed.`}
          </p>

          {deadlineDisplay && (
            <p className="text-sm text-[#6B655C]/80 mb-8">
              {locale === 'bn'
                ? `জমা দেওয়ার শেষ সময় ছিল: ${deadlineDisplay}`
                : `Submissions closed on: ${deadlineDisplay}`}
            </p>
          )}

          <div className="bg-[#FAF9F6] border border-[#E5E0D8] rounded-2xl p-5 sm:p-6 text-sm text-[#6B655C] mb-8 text-left space-y-2">
            <p className="font-semibold text-charcoal">
              {locale === 'bn' ? "কেন জমা দেওয়া যাচ্ছে না?" : "Why can't I submit?"}
            </p>
            <p>
              {locale === 'bn'
                ? "প্রদর্শনীর নিয়ম অনুযায়ী, প্রদর্শনী শুরুর দিন রাত ১১:৫৯ পর্যন্ত শিল্পকর্ম জমা দেওয়া যায়। এর পরে সকল জমা বন্ধ থাকে।"
                : "Per exhibition rules, artworks can only be submitted up until 11:59 PM on the exhibition start date. After this deadline, all submissions are closed."}
            </p>
          </div>

          <Button asChild className="rounded-full px-8">
            <Link href="/dashboard">{locale === 'bn' ? "ড্যাশবোর্ডে ফিরে যান" : "Back to Dashboard"}</Link>
          </Button>
        </div>
      </div>
    )
  }

  // ── Submission is OPEN — show the wizard ─────────────────────────────────
  const formattedExhibition = {
    id: exhibition.id,
    title_en: exhibition.theme_en || 'Annual Exhibition',
    title_bn: exhibition.theme_bn || 'বার্ষিক প্রদর্শনী',
    submission_end: exhibition.submission_end,
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-3xl font-bold mb-2">
          {locale === 'bn' ? "নতুন শিল্পকর্ম জমা দিন" : "Submit New Artwork"}
        </h1>
        <p className="text-muted-foreground">
          {locale === 'bn'
            ? "যেকোন সময় আপনার জমাটি সংরক্ষণ করতে পারেন এবং পরে ফিরে আসতে পারেন।"
            : "Complete the wizard to submit your artwork. Your progress is automatically saved."}
        </p>
        {/* Countdown warning when deadline is near (within 24 hours) */}
        {exhibition.submission_end && (() => {
          const hoursLeft = (new Date(exhibition.submission_end).getTime() - now.getTime()) / (1000 * 60 * 60)
          return hoursLeft > 0 && hoursLeft <= 24 ? (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 text-sm">
              <strong>{locale === 'bn' ? "সতর্কতা:" : "Heads up:"}</strong>{' '}
              {locale === 'bn'
                ? `জমা দেওয়ার সময়সীমা মাত্র ${Math.ceil(hoursLeft)} ঘণ্টা বাকি।`
                : `The submission window closes in approximately ${Math.ceil(hoursLeft)} hour(s).`}
            </div>
          ) : null
        })()}
      </div>

      <SubmissionWizard locale={locale} exhibitions={[formattedExhibition]} />
    </div>
  )
}
