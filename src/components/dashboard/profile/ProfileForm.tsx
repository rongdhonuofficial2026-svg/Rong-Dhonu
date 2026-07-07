'use client'

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { updateProfile, uploadAvatar, deleteAvatar } from "@/actions/member"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Camera, Trash2, Loader2, User } from "lucide-react"

interface Profile {
  id?: string
  full_name_en?: string | null
  full_name_bn?: string | null
  bio_en?: string | null
  bio_bn?: string | null
  phone?: string | null
  instagram_url?: string | null
  website_url?: string | null
  avatar_url?: string | null
  notify_email?: boolean | null
  notify_in_app?: boolean | null
  notify_exhibition_announcements?: boolean | null
  notify_deadline_reminders?: boolean | null
  notify_artwork_updates?: boolean | null
}

function AvatarUploader({ currentUrl, locale }: { currentUrl?: string | null; locale: string }) {
  const supabase = createClient()
  const [uploading, setUploading] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(currentUrl || null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", { description: "Please select an image under 5MB." })
      return
    }

    try {
      setUploading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not signed in")

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${user.id}/avatar.${ext}`

      // Upload to avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, cacheControl: '3600' })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

      // Add cache-busting so preview refreshes immediately
      const bustedUrl = `${publicUrl}?t=${Date.now()}`

      setPreview(bustedUrl)

      // Save to profile
      const res = await uploadAvatar(publicUrl)
      if (res.error) throw new Error(res.error)

      toast.success(locale === 'bn' ? "ছবি আপলোড হয়েছে" : "Avatar updated successfully!")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed"
      toast.error("Upload Failed", { description: message })
    } finally {
      setUploading(false)
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDelete = async () => {
    try {
      setUploading(true)
      const res = await deleteAvatar()
      if (res.error) throw new Error(res.error)
      setPreview(null)
      toast.success(locale === 'bn' ? "ছবি সরানো হয়েছে" : "Avatar removed")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Delete failed"
      toast.error("Error", { description: message })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Avatar Preview */}
      <div className="relative shrink-0">
        <div className="w-28 h-28 rounded-full border-4 border-border overflow-hidden bg-muted flex items-center justify-center">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-muted-foreground" />
          )}
        </div>
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-background/70 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex flex-col gap-3 text-sm">
        <p className="font-medium text-base">
          {locale === 'bn' ? "প্রোফাইল ছবি" : "Profile Picture"}
        </p>
        <p className="text-muted-foreground text-xs">
          {locale === 'bn'
            ? "JPG, PNG, বা WebP, সর্বোচ্চ ৫ MB। এটি গ্যালারি, শিল্পী প্রোফাইল এবং মডারেশনে দেখাবে।"
            : "JPG, PNG or WebP, max 5MB. Shown in gallery, artist profile, and moderation cards."}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Camera className="w-4 h-4" />
            {preview
              ? (locale === 'bn' ? "বদলান" : "Change Photo")
              : (locale === 'bn' ? "ছবি আপলোড করুন" : "Upload Photo")}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={handleDelete}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              {locale === 'bn' ? "সরান" : "Remove"}
            </Button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}

export function ProfileForm({ profile, locale }: { profile: Profile | null; locale: string }) {
  const [saving, setSaving] = React.useState(false)

  const action = async (formData: FormData) => {
    setSaving(true)
    const result = await updateProfile(formData)
    setSaving(false)

    if (result.error) {
      toast.error(locale === 'bn' ? "ত্রুটি" : "Error", { description: result.error })
    } else {
      toast.success(locale === 'bn' ? "সফল" : "Saved!", {
        description: locale === 'bn' ? "প্রোফাইল আপডেট করা হয়েছে" : "Your profile has been updated successfully."
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Avatar Upload (outside the form since it uses client-side upload) */}
      <Card>
        <CardHeader>
          <CardTitle>{locale === 'bn' ? "প্রোফাইল ছবি" : "Profile Picture"}</CardTitle>
          <CardDescription>
            {locale === 'bn'
              ? "আপনার প্রোফাইল ছবি গ্যালারি, শিল্পী পাতা এবং মডারেশনে দেখাবে।"
              : "Your photo appears in the public gallery, artist directory, and moderation cards."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUploader currentUrl={profile?.avatar_url} locale={locale} />
        </CardContent>
      </Card>

      {/* Profile Details Form */}
      <form action={action} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'bn' ? "প্রাথমিক তথ্য" : "Basic Information"}</CardTitle>
            <CardDescription>
              {locale === 'bn' ? "আপনার নাম এবং শিল্পী বায়ো আপডেট করুন।" : "Your name and artist biography."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {locale === 'bn' ? "সম্পূর্ণ নাম (ইংরেজি)" : "Full Name (English)"} <span className="text-destructive">*</span>
                </label>
                <Input name="full_name_en" defaultValue={profile?.full_name_en || ''} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {locale === 'bn' ? "সম্পূর্ণ নাম (বাংলা)" : "Full Name (Bengali)"}
                </label>
                <Input name="full_name_bn" defaultValue={profile?.full_name_bn || ''} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{locale === 'bn' ? "বায়ো (ইংরেজি)" : "Biography (English)"}</label>
              <Textarea name="bio_en" defaultValue={profile?.bio_en || ''} rows={4}
                placeholder="Tell visitors about yourself, your artistic journey and inspiration..." />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{locale === 'bn' ? "বায়ো (বাংলা)" : "Biography (Bengali)"}</label>
              <Textarea name="bio_bn" defaultValue={profile?.bio_bn || ''} rows={4}
                placeholder="আপনার শিল্পী পরিচয় এবং অনুপ্রেরণা সম্পর্কে লিখুন..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === 'bn' ? "যোগাযোগ এবং সোশ্যাল" : "Contact & Social Links"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">{locale === 'bn' ? "ফোন নম্বর" : "Phone Number"}</label>
                <Input name="phone" defaultValue={profile?.phone || ''} placeholder="+880..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{locale === 'bn' ? "ইনস্টাগ্রাম" : "Instagram URL"}</label>
                <Input name="instagram_url" type="url" defaultValue={profile?.instagram_url || ''} placeholder="https://instagram.com/yourhandle" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">{locale === 'bn' ? "ওয়েবসাইট / পোর্টফোলিও" : "Website / Portfolio URL"}</label>
                <Input name="website_url" type="url" defaultValue={profile?.website_url || ''} placeholder="https://yourwebsite.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === 'bn' ? "নোটিফিকেশন সেটিংস" : "Notification Preferences"}</CardTitle>
            <CardDescription>
              {locale === 'bn' ? "আপনি কীভাবে আপডেট পেতে চান তা চয়ন করুন।" : "Choose how you want to receive updates."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'notify_email', label: locale === 'bn' ? "ইমেইল নোটিফিকেশন" : "Email Notifications", desc: "Receive important updates via email", default: profile?.notify_email },
              { name: 'notify_in_app', label: locale === 'bn' ? "ইন-অ্যাপ নোটিফিকেশন" : "In-App Notifications", desc: "Receive updates within the dashboard", default: profile?.notify_in_app },
              { name: 'notify_artwork_updates', label: "Artwork Status Updates", desc: "Get notified when your artwork is approved, rejected, or needs revision", default: profile?.notify_artwork_updates },
              { name: 'notify_exhibition_announcements', label: "Exhibition Announcements", desc: "Be notified when new exhibitions open", default: profile?.notify_exhibition_announcements },
              { name: 'notify_deadline_reminders', label: "Deadline Reminders", desc: "Receive reminders before submission deadlines", default: profile?.notify_deadline_reminders },
            ].map(setting => (
              <div key={setting.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="space-y-0.5">
                  <label htmlFor={setting.name} className="text-sm font-medium cursor-pointer">{setting.label}</label>
                  <p className="text-xs text-muted-foreground">{setting.desc}</p>
                </div>
                <input
                  id={setting.name}
                  type="checkbox"
                  name={setting.name}
                  value="true"
                  defaultChecked={setting.default !== false}
                  className="w-4 h-4 accent-primary"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="min-w-36">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {locale === 'bn' ? "সংরক্ষণ করা হচ্ছে..." : "Saving..."}</>
              : (locale === 'bn' ? "সংরক্ষণ করুন" : "Save Changes")}
          </Button>
        </div>
      </form>
    </div>
  )
}
