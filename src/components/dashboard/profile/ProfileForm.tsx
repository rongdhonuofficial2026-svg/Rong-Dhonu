'use client'

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { updateProfile, uploadAvatar, deleteAvatar } from "@/actions/member"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Camera, Trash2, Loader2, User, Check } from "lucide-react"

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
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
      {/* Avatar Preview */}
      <div className="relative shrink-0">
        <div className="w-32 h-32 rounded-full border border-[#E5E0D8] overflow-hidden bg-white flex items-center justify-center shadow-sm">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-[#E5E0D8]" />
          )}
        </div>
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center backdrop-blur-[2px]">
            <Loader2 className="w-6 h-6 animate-spin text-charcoal" />
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex flex-col gap-3 text-sm text-center sm:text-left w-full sm:w-auto pt-2">
        <p className="font-serif font-bold text-lg sm:text-xl text-charcoal tracking-tight">
          {locale === 'bn' ? "প্রোফাইল ছবি" : "Profile Picture"}
        </p>
        <p className="text-[#6B655C] text-sm leading-relaxed max-w-sm">
          {locale === 'bn'
            ? "JPG, PNG, বা WebP, সর্বোচ্চ ৫ MB। এটি গ্যালারি এবং শিল্পী প্রোফাইলে দেখাবে।"
            : "JPG, PNG or WebP, max 5MB. Shown in gallery, artist profile, and moderation cards."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full">
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto min-h-[44px] rounded-full gap-2 border-[#E5E0D8] text-charcoal hover:bg-[#F5F2EB] hover:text-charcoal"
          >
            <Camera className="w-4 h-4" />
            {preview
              ? (locale === 'bn' ? "ছবি বদলান" : "Change Photo")
              : (locale === 'bn' ? "ছবি আপলোড করুন" : "Upload Photo")}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              disabled={uploading}
              onClick={handleDelete}
              className="w-full sm:w-auto min-h-[44px] rounded-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
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
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      {/* Avatar Upload */}
      <div className="bg-[#FAF9F6] p-5 sm:p-8 rounded-3xl md:rounded-2xl border border-[#E5E0D8]/60 shadow-sm">
        <AvatarUploader currentUrl={profile?.avatar_url} locale={locale} />
      </div>

      {/* Profile Details Form */}
      <form action={action} className="space-y-6 sm:space-y-8">
        
        {/* Basic Information */}
        <div className="bg-[#FAF9F6] p-5 sm:p-8 rounded-3xl md:rounded-2xl border border-[#E5E0D8]/60 shadow-sm">
          <div className="mb-6 border-b border-[#E5E0D8] pb-4">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal tracking-tight">
              {locale === 'bn' ? "প্রাথমিক তথ্য" : "Basic Information"}
            </h3>
            <p className="text-sm sm:text-base font-medium text-[#6B655C] mt-1.5">
              {locale === 'bn' ? "আপনার নাম এবং শিল্পী বায়ো আপডেট করুন।" : "Your name and artist biography."}
            </p>
          </div>
          
          <div className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">
                  {locale === 'bn' ? "সম্পূর্ণ নাম (ইংরেজি)" : "Full Name (English)"} <span className="text-destructive">*</span>
                </label>
                <Input name="full_name_en" defaultValue={profile?.full_name_en || ''} required className="min-h-[44px] rounded-xl border-[#E5E0D8]/80 focus:border-charcoal focus:ring-1 focus:ring-charcoal" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">
                  {locale === 'bn' ? "সম্পূর্ণ নাম (বাংলা)" : "Full Name (Bengali)"}
                </label>
                <Input name="full_name_bn" defaultValue={profile?.full_name_bn || ''} className="min-h-[44px] rounded-xl border-[#E5E0D8]/80 focus:border-charcoal focus:ring-1 focus:ring-charcoal" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal">{locale === 'bn' ? "বায়ো (ইংরেজি)" : "Biography (English)"}</label>
              <Textarea name="bio_en" defaultValue={profile?.bio_en || ''} rows={4}
                placeholder="Tell visitors about yourself, your artistic journey and inspiration..." 
                className="rounded-xl border-[#E5E0D8]/80 focus:border-charcoal focus:ring-1 focus:ring-charcoal resize-none leading-relaxed" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-charcoal">{locale === 'bn' ? "বায়ো (বাংলা)" : "Biography (Bengali)"}</label>
              <Textarea name="bio_bn" defaultValue={profile?.bio_bn || ''} rows={4}
                placeholder="আপনার শিল্পী পরিচয় এবং অনুপ্রেরণা সম্পর্কে লিখুন..." 
                className="rounded-xl border-[#E5E0D8]/80 focus:border-charcoal focus:ring-1 focus:ring-charcoal resize-none leading-relaxed" />
            </div>
          </div>
        </div>

        {/* Contact & Social Links */}
        <div className="bg-[#FAF9F6] p-5 sm:p-8 rounded-3xl md:rounded-2xl border border-[#E5E0D8]/60 shadow-sm">
          <div className="mb-6 border-b border-[#E5E0D8] pb-4">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal tracking-tight">
              {locale === 'bn' ? "যোগাযোগ এবং সোশ্যাল" : "Contact & Social Links"}
            </h3>
          </div>
          
          <div className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">{locale === 'bn' ? "ফোন নম্বর" : "Phone Number"}</label>
                <Input name="phone" defaultValue={profile?.phone || ''} placeholder="+880..." className="min-h-[44px] rounded-xl border-[#E5E0D8]/80 focus:border-charcoal focus:ring-1 focus:ring-charcoal" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">{locale === 'bn' ? "ইনস্টাগ্রাম" : "Instagram URL"}</label>
                <Input name="instagram_url" type="url" defaultValue={profile?.instagram_url || ''} placeholder="https://instagram.com/yourhandle" className="min-h-[44px] rounded-xl border-[#E5E0D8]/80 focus:border-charcoal focus:ring-1 focus:ring-charcoal" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-charcoal">{locale === 'bn' ? "ওয়েবসাইট / পোর্টফোলিও" : "Website / Portfolio URL"}</label>
                <Input name="website_url" type="url" defaultValue={profile?.website_url || ''} placeholder="https://yourwebsite.com" className="min-h-[44px] rounded-xl border-[#E5E0D8]/80 focus:border-charcoal focus:ring-1 focus:ring-charcoal" />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-[#FAF9F6] p-5 sm:p-8 rounded-3xl md:rounded-2xl border border-[#E5E0D8]/60 shadow-sm">
          <div className="mb-6 border-b border-[#E5E0D8] pb-4">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal tracking-tight">
              {locale === 'bn' ? "নোটিফিকেশন সেটিংস" : "Notification Preferences"}
            </h3>
            <p className="text-sm sm:text-base font-medium text-[#6B655C] mt-1.5">
              {locale === 'bn' ? "আপনি কীভাবে আপডেট পেতে চান তা চয়ন করুন।" : "Choose how you want to receive updates."}
            </p>
          </div>
          
          <div className="space-y-3">
            {[
              { name: 'notify_email', label: locale === 'bn' ? "ইমেইল নোটিফিকেশন" : "Email Notifications", desc: "Receive important updates via email", default: profile?.notify_email },
              { name: 'notify_in_app', label: locale === 'bn' ? "ইন-অ্যাপ নোটিফিকেশন" : "In-App Notifications", desc: "Receive updates within the dashboard", default: profile?.notify_in_app },
              { name: 'notify_artwork_updates', label: "Artwork Status Updates", desc: "Get notified when your artwork is approved, rejected, or needs revision", default: profile?.notify_artwork_updates },
              { name: 'notify_exhibition_announcements', label: "Exhibition Announcements", desc: "Be notified when new exhibitions open", default: profile?.notify_exhibition_announcements },
              { name: 'notify_deadline_reminders', label: "Deadline Reminders", desc: "Receive reminders before submission deadlines", default: profile?.notify_deadline_reminders },
            ].map(setting => (
              <label key={setting.name} className="flex items-center justify-between p-4 bg-white border border-[#E5E0D8]/60 rounded-xl hover:bg-[#F5F2EB] transition-colors cursor-pointer group">
                <div className="space-y-0.5 pr-4">
                  <span className="text-sm font-semibold text-charcoal">{setting.label}</span>
                  <p className="text-xs font-medium text-[#6B655C] leading-relaxed">{setting.desc}</p>
                </div>
                <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                  <input
                    id={setting.name}
                    type="checkbox"
                    name={setting.name}
                    value="true"
                    defaultChecked={setting.default !== false}
                    className="peer appearance-none w-5 h-5 border-2 border-[#E5E0D8] rounded-[4px] checked:bg-accent-gold checked:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:ring-offset-1 transition-all cursor-pointer"
                  />
                  <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={saving} className="w-full sm:w-auto sm:min-w-40 min-h-[44px] rounded-full bg-charcoal hover:bg-[#2A2A2A] text-white shadow-lg active:scale-95 transition-all gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving
              ? (locale === 'bn' ? "সংরক্ষণ করা হচ্ছে..." : "Saving...")
              : (locale === 'bn' ? "সংরক্ষণ করুন" : "Save Changes")}
          </Button>
        </div>
      </form>
    </div>
  )
}
