import { createClient } from "@/lib/supabase/server"
import { SubmissionWizard } from "@/components/dashboard/artworks/SubmissionWizard"

export default async function NewArtworkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { getFeaturedExhibition, isRegistrationOpen } = await import("@/lib/exhibition-lifecycle")
  const supabase = await createClient()

  // Find the featured/upcoming exhibition
  const exhibition = await getFeaturedExhibition()
  
  // Check if registration is open
  const registrationOpen = isRegistrationOpen(exhibition)

  if (!registrationOpen) {
    return (
      <div className="space-y-8 pb-12">
        <div className="max-w-3xl mx-auto text-center py-20">
          <h1 className="font-serif text-3xl font-bold mb-4 text-red-500">
            {locale === 'bn' ? "নিবন্ধন বন্ধ আছে" : "Registration Closed"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {locale === 'bn' 
              ? "বর্তমানে কোনো প্রদর্শনীর জন্য শিল্পকর্ম জমা নেওয়া হচ্ছে না। পরবর্তী প্রদর্শনীর জন্য অপেক্ষা করুন।" 
              : "We are not currently accepting artwork submissions. Please wait for the next exhibition's registration window."}
          </p>
        </div>
      </div>
    )
  }

  // Format exhibition for the wizard dropdown
  const formattedExhibition = {
    id: exhibition.id,
    title_en: exhibition.theme_en,
    title_bn: exhibition.theme_bn,
  }

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

      <SubmissionWizard locale={locale} exhibitions={[formattedExhibition]} />
    </div>
  )
}
