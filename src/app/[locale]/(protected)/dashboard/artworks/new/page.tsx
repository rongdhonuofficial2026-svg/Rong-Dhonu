import { createClient } from "@/lib/supabase/server"
import { SubmissionWizard } from "@/components/dashboard/artworks/SubmissionWizard"

export default async function NewArtworkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  // Fetch active/upcoming exhibitions for the dropdown selection
  const { data: exhibitions } = await supabase
    .from('exhibitions')
    .select('id, title_en, title_bn')
    .in('status', ['active', 'upcoming'])
    .order('start_date', { ascending: false })

  return (
    <div className="space-y-8 pb-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-3xl font-bold mb-2">
          {locale === 'bn' ? "নতুন শিল্পকর্ম জমা দিন" : "Submit New Artwork"}
        </h1>
        <p className="text-muted-foreground">
          {locale === 'bn' ? "যেকোন সময় আপনার জমাটি সংরক্ষণ করতে পারেন এবং পরে ফিরে আসতে পারেন।" : "Complete the wizard to submit your artwork. Your progress is automatically saved."}
        </p>
      </div>

      <SubmissionWizard locale={locale} exhibitions={exhibitions || []} />
    </div>
  )
}
