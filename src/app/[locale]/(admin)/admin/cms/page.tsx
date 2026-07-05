import { createClient } from "@/lib/supabase/server"
import { CMSForm } from "@/components/admin/CMSForm"

export default async function CMSManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()

  // We fetch the current published content, and if there is a draft, we fetch that too.
  // For this scaffold, we'll assume the CMS table returns a structured JSON.
  const { data: cmsData } = await supabase
    .from('cms_content')
    .select('*')
    .eq('page_key', 'homepage')
    .eq('locale', locale)
    .single()

  // Fallback structure if database is empty
  const defaultContent = {
    hero: {
      title: locale === 'bn' ? "রংধনু বার্ষিক চারুকলা প্রদর্শনী" : "Rongdhono Annual Fine Arts Exhibition",
      subtitle: locale === 'bn' ? "বাংলাদেশের প্রতিভাবান শিল্পীদের উদযাপন" : "Celebrating the finest artists of Bangladesh."
    },
    about: {
      title: locale === 'bn' ? "আমাদের সম্পর্কে" : "About Us",
      content: "Rongdhono is a prestigious annual fine arts exhibition..."
    }
  }

  const initialData = cmsData?.content || defaultContent

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="font-serif text-3xl font-bold mb-2">CMS Management</h1>
        <p className="text-muted-foreground">Manage and version content across the public website.</p>
      </div>

      <CMSForm initialData={initialData} locale={locale} />
    </div>
  )
}
