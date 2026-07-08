import { getCmsPages } from "@/actions/admin/cms"
import { CMSEngineManager } from "@/components/admin/cms/CMSEngineManager"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return {
    title: locale === 'bn' ? 'কন্টেন্ট স্টুডিও | রঙধনু' : 'Content Studio | Rongdhono',
  }
}

export default async function CMSManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  // Fetch initial pages data with sections and content fields via Server Action
  const res = await getCmsPages()
  
  if (!res.success || !res.pages) {
    return (
      <div className="py-20 text-center text-red-400 font-serif text-lg bg-[#0e0e10] border border-white/[0.06] rounded-3xl p-8">
        Failed to initialize Content Studio database schema. Please apply migrations and try again.
      </div>
    )
  }

  return (
    <div className="space-y-8 pt-8">
      <CMSEngineManager initialPages={res.pages} locale={locale} />
    </div>
  )
}
