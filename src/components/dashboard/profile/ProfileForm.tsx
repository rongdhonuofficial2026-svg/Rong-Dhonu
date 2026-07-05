 
 
 
'use client'

import * as React from "react"
import { useFormStatus } from "react-dom"
import { updateProfile } from "@/actions/member"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

function SubmitButton({ locale }: { locale: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending 
        ? (locale === 'bn' ? "সংরক্ষণ করা হচ্ছে..." : "Saving...") 
        : (locale === 'bn' ? "সংরক্ষণ করুন" : "Save Changes")}
    </Button>
  )
}

export function ProfileForm({ profile, locale }: { profile: any, locale: string }) {
  const action = async (formData: FormData) => {
    const result = await updateProfile(formData)
    
    if (result.error) {
      toast.error(locale === 'bn' ? "ত্রুটি" : "Error", {
        description: result.error
      })
    } else {
      toast.success(locale === 'bn' ? "সফল" : "Success", {
        description: locale === 'bn' ? "প্রোফাইল আপডেট করা হয়েছে" : "Profile updated successfully."
      })
    }
  }

  return (
    <form action={action} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{locale === 'bn' ? "প্রাথমিক তথ্য" : "Basic Information"}</CardTitle>
          <CardDescription>
            {locale === 'bn' ? "আপনার নাম এবং বায়ো আপডেট করুন।" : "Update your name and biography."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">{locale === 'bn' ? "সম্পূর্ণ নাম (ইংরেজি)" : "Full Name (English)"}</label>
              <Input name="full_name_en" defaultValue={profile?.full_name_en || ''} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{locale === 'bn' ? "সম্পূর্ণ নাম (বাংলা)" : "Full Name (Bengali)"}</label>
              <Input name="full_name_bn" defaultValue={profile?.full_name_bn || ''} />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{locale === 'bn' ? "বায়ো (ইংরেজি)" : "Biography (English)"}</label>
            <Textarea name="bio_en" defaultValue={profile?.bio_en || ''} rows={4} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{locale === 'bn' ? "বায়ো (বাংলা)" : "Biography (Bengali)"}</label>
            <Textarea name="bio_bn" defaultValue={profile?.bio_bn || ''} rows={4} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{locale === 'bn' ? "যোগাযোগ এবং সোশ্যাল" : "Contact & Social"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">{locale === 'bn' ? "ফোন" : "Phone Number"}</label>
              <Input name="phone" defaultValue={profile?.phone || ''} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{locale === 'bn' ? "ইনস্টাগ্রাম ইউআরএল" : "Instagram URL"}</label>
              <Input name="instagram_url" type="url" defaultValue={profile?.instagram_url || ''} placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{locale === 'bn' ? "ওয়েবসাইট" : "Website URL"}</label>
              <Input name="website_url" type="url" defaultValue={profile?.website_url || ''} placeholder="https://..." />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{locale === 'bn' ? "নোটিফিকেশন সেটিংস" : "Notification Settings"}</CardTitle>
          <CardDescription>
            {locale === 'bn' ? "আপনি কীভাবে আপডেট পেতে চান তা চয়ন করুন।" : "Choose how you want to receive updates."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">{locale === 'bn' ? "ইমেইল নোটিফিকেশন" : "Email Notifications"}</label>
              <p className="text-xs text-muted-foreground">Receive important updates via email</p>
            </div>
            <input type="checkbox" name="notify_email" value="true" defaultChecked={profile?.notify_email !== false} className="w-4 h-4" />
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">{locale === 'bn' ? "ইন-অ্যাপ নোটিফিকেশন" : "In-App Notifications"}</label>
              <p className="text-xs text-muted-foreground">Receive updates within the dashboard</p>
            </div>
            <input type="checkbox" name="notify_in_app" value="true" defaultChecked={profile?.notify_in_app !== false} className="w-4 h-4" />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Artwork Updates</label>
              <p className="text-xs text-muted-foreground">Get notified when your artwork is approved or rejected</p>
            </div>
            <input type="checkbox" name="notify_artwork_updates" value="true" defaultChecked={profile?.notify_artwork_updates !== false} className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <SubmitButton locale={locale} />
      </div>
    </form>
  )
}
