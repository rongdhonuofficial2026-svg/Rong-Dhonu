import { createClient } from "@/lib/supabase/server"
import { SubmissionWizard } from "@/components/dashboard/artworks/SubmissionWizard"
import { Link } from "@/lib/i18n/routing"
import { Button } from "@/components/ui/button"

export default async function NewArtworkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { getFeaturedExhibition } = await import("@/lib/exhibition-lifecycle")
  const supabase = await createClient()

  // Find the featured/upcoming exhibition
  const exhibition = await getFeaturedExhibition()

  // Check: is there any exhibition accepting submissions right now?
  // An exhibition accepts submissions if it is not draft/archived and has a valid date window
  const now = new Date()
  const isSubmissionOpen = (exh: any) => {
    if (!exh) return false
    if (exh.status === 'draft' || exh.status === 'archived') return false
    // If submission_end is set and has not passed, accept submissions
    if (exh.submission_end && now > new Date(exh.submission_end)) return false
    // If registration_start is set and hasn't started yet, not open
    if (exh.registration_start && now < new Date(exh.registration_start)) return false
    return true
  }

  const submissionOpen = isSubmissionOpen(exhibition)

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

  // Format exhibition for the wizard
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
        {!submissionOpen && (
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm">
            <strong>Note:</strong> The submission window for <strong>{formattedExhibition.title_en}</strong> may be outside the active period.
            You can still submit your artwork and it will be reviewed when moderation opens.
          </div>
        )}
      </div>

      <SubmissionWizard locale={locale} exhibitions={[formattedExhibition]} />
    </div>
  )
}
