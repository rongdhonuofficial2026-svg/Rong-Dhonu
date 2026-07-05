import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/dashboard/profile/ProfileForm"

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl font-bold mb-2">
          {locale === 'bn' ? "প্রোফাইল সেটিংস" : "Profile Settings"}
        </h1>
        <p className="text-muted-foreground">
          {locale === 'bn' ? "আপনার ব্যক্তিগত তথ্য এবং শিল্পী বায়ো পরিচালনা করুন।" : "Manage your personal information and artist biography."}
        </p>
      </div>

      <ProfileForm profile={profile} locale={locale} />
    </div>
  )
}
